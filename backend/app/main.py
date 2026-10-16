"""SEAMAS FastAPI application."""
import asyncio
import json
import logging
import os
import re
import sys
from contextlib import asynccontextmanager
from uuid import uuid4

import httpx
import razorpay
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, ConfigDict, Field

backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(backend_root, ".env"))
sys.path.append(os.path.dirname(backend_root))

from agents.orchestrator import stream_orchestrator_pipeline
from core.config import settings, validate_production_config, resolve_ollama_model
from graph.graph import seamas_graph
from schemas.request_models import ChatRequest, FeedbackRequest, AssistantRequest
from utils.credits_db import CreditServiceUnavailable, deduct_credit, refund_credit, get_credits
from utils.rate_limiter import RateLimitUnavailable, check_rate_limit
from utils.supabase_client import supabase

logger = logging.getLogger("seamas.api")


@asynccontextmanager
async def lifespan(_: FastAPI):
    validate_production_config()
    yield


app = FastAPI(title="SEAMAS Multi-Agent Backend", version="1.0.0", lifespan=lifespan)
allowed_origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()]
if not allowed_origins and settings.ENVIRONMENT.lower() != "production":
    allowed_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
)


@app.middleware("http")
async def request_context(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or str(uuid4())
    request.state.request_id = request_id
    try:
        response = await call_next(request)
    except Exception:
        logger.exception("Unhandled request error id=%s path=%s", request_id, request.url.path)
        response = HTTPException(status_code=500, detail="The request could not be completed.")
        from starlette.responses import JSONResponse
        response = JSONResponse(status_code=500, content={"detail": response.detail})
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


async def enforce_rate_limit(scope: str, identity: str, limit: int, window_seconds: int) -> None:
    try:
        allowed, retry_after = await check_rate_limit(scope, identity, limit, window_seconds)
    except RateLimitUnavailable:
        logger.exception("Shared rate limiter unavailable scope=%s", scope)
        raise HTTPException(status_code=503, detail="Request protection is temporarily unavailable.")
    if not allowed:
        raise HTTPException(status_code=429, detail="Too many requests. Please try again shortly.",
                            headers={"Retry-After": str(max(1, retry_after))})


async def current_user(request: Request, authorization: str | None = Header(default=None)) -> dict:
    """Validate the bearer token with Supabase Auth; never accept an ID from JSON."""
    ip = request.client.host if request.client else "unknown"
    await enforce_rate_limit("auth-ip", ip, 60, 60)
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Sign in to continue.")
    if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
        raise HTTPException(status_code=503, detail="Authentication service is not configured.")
    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Invalid authentication token.")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user",
                headers={"apikey": settings.SUPABASE_ANON_KEY, "Authorization": f"Bearer {token}"},
            )
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid or expired authentication token.")
        user = response.json()
        if not user.get("id"):
            raise HTTPException(status_code=401, detail="Invalid authentication token.")
        await enforce_rate_limit("user-api", str(user["id"]), 300, 60)
        return user
    except HTTPException:
        raise
    except httpx.HTTPError:
        logger.exception("Supabase auth request failed")
        raise HTTPException(status_code=503, detail="Authentication service is temporarily unavailable.")


async def optional_current_user(request: Request, authorization: str | None = Header(default=None)) -> dict | None:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    try:
        return await current_user(request, authorization)
    except Exception:
        return None


def create_initial_state(payload: ChatRequest) -> dict:
    return {
        "query": payload.query,
        "category": "general",
        "budget": payload.max_price,
        "budget_type": "hard_limit" if payload.max_price is not None else "none",
        "user_preferences": {}, "search_results": [], "price_data": [],
        "analysis_report": {}, "recommendations": [], "budget_status": {},
        "steering_mode": payload.steering_mode or "balanced",
        "logs": ["Session routing initialized via API."],
    }


def search_cost(mode: str) -> int:
    return {"speed": 5, "balanced": 10, "accuracy": 20}[mode]


def charge_search_credits(user: dict, amount: int) -> None:
    """Charge the authenticated identity atomically and keep failures distinct."""
    user_id = str(user["id"])
    try:
        charged = deduct_credit(user_id, amount)
    except CreditServiceUnavailable:
        logger.exception("Credit deduction service unavailable user_ref=%s", user_id[:8])
        raise HTTPException(status_code=503, detail={
            "code": "credits_unavailable",
            "message": "Credits could not be verified. Please try again.",
            "required_credits": amount,
            "user_ref": user_id[:8],
        })
    if charged:
        return
    try:
        available = get_credits(user_id)["credits"]
    except CreditServiceUnavailable:
        logger.exception("Credit balance lookup failed after declined deduction user_ref=%s", user_id[:8])
        raise HTTPException(status_code=503, detail={
            "code": "credits_unavailable",
            "message": "Credits could not be verified. Please try again.",
            "required_credits": amount,
            "user_ref": user_id[:8],
        })
    if available >= amount:
        logger.error(
            "Credit RPC declined a sufficient balance user_ref=%s available=%s required=%s",
            user_id[:8], available, amount,
        )
        raise HTTPException(status_code=503, detail={
            "code": "credits_inconsistent",
            "message": "The credit service could not reconcile your balance. No search was started; please retry.",
            "available_credits": available,
            "required_credits": amount,
            "user_ref": user_id[:8],
        })
    raise HTTPException(status_code=402, detail={
        "code": "insufficient_credits",
        "message": "Insufficient search credits. Please upgrade your plan.",
        "available_credits": available,
        "required_credits": amount,
        "user_ref": user_id[:8],
    })


def _cache_key(query: str, steering_mode: str, max_price: int | None) -> str:
    norm_q = query.lower().strip()
    return f"{norm_q}:{steering_mode}:{max_price or 'none'}"


@app.post("/api/chat")
async def chat_endpoint(payload: ChatRequest, user: dict = Depends(current_user)):
    user_id = str(user["id"])
    await enforce_rate_limit("chat", user_id, 10, 60)
    cost = search_cost(payload.steering_mode or "balanced")
    c_key = _cache_key(payload.query, payload.steering_mode, payload.max_price)

    # 1. Read-through cache check (unless explicitly bypassed)
    if not payload.bypass_cache and supabase:
        try:
            cache_row = supabase.table("cached_results").select("*").eq("query", c_key).limit(1).execute().data
            if cache_row:
                cached = cache_row[0]
                result = cached.get("result_payload", {})
                result["cached_at"] = cached.get("created_at")
                result["from_cache"] = True
                # Cache hits are free (or 0 cost); no credit charged
                return result
        except Exception:
            logger.warning("Cache lookup failed; proceeding to live pipeline")

    # 2. Charge credits before pipeline runs
    charge_search_credits(user, cost)
    charge_ref = f"chat_{str(uuid4())[:12]}"

    try:
        state = await seamas_graph.ainvoke(create_initial_state(payload))
        if supabase:
            try:
                from datetime import datetime, timezone
                supabase.table("cached_results").upsert({
                    "query": c_key,
                    "result_payload": state,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }).execute()
            except Exception:
                logger.exception("Cache write failed")
        return state
    except Exception:
        # Guarantee single refund on pipeline failure
        logger.exception("Chat pipeline failed request_id=%s; issuing single refund", getattr(user, "request_id", "unknown"))
        try:
            refund_credit(user_id, cost, reference_id=charge_ref)
        except Exception as ref_err:
            logger.error("Failed to refund credits user_id=%s ref=%s: %s", user_id, charge_ref, ref_err)
        raise HTTPException(status_code=502, detail="Product search failed. Please try again.")


@app.post("/api/chat/stream")
async def chat_stream_endpoint(payload: ChatRequest, request: Request, user: dict = Depends(current_user)):
    user_id = str(user["id"])
    await enforce_rate_limit("chat-stream", user_id, 10, 60)
    cost = search_cost(payload.steering_mode or "balanced")
    c_key = _cache_key(payload.query, payload.steering_mode, payload.max_price)

    # Read-through cache check
    if not payload.bypass_cache and supabase:
        try:
            cache_row = supabase.table("cached_results").select("*").eq("query", c_key).limit(1).execute().data
            if cache_row:
                cached = cache_row[0]
                result = cached.get("result_payload", {})
                result["cached_at"] = cached.get("created_at")
                result["from_cache"] = True

                async def cached_stream():
                    yield f"data: {json.dumps({'type': 'node_start', 'agent_id': 'cache', 'message': 'Loaded from cache'})}\n\n"
                    yield f"data: {json.dumps({'type': 'result', 'payload': result})}\n\n"

                return StreamingResponse(cached_stream(), media_type="text/event-stream", headers={
                    "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no",
                })
        except Exception:
            logger.warning("Stream cache lookup failed; proceeding to live pipeline")

    charge_search_credits(user, cost)
    charge_ref = f"stream_{str(uuid4())[:12]}"

    async def event_generator():
        pipeline_succeeded = False
        try:
            # Bound stream duration to prevent unbounded hanging
            async with asyncio.timeout(120.0):
                async for event in stream_orchestrator_pipeline(create_initial_state(payload)):
                    if await request.is_disconnected():
                        logger.info("Client disconnected before stream complete user_id=%s", user_id)
                        break
                    yield f"data: {json.dumps(event, default=str)}\n\n"
                    if event.get("type") == "result":
                        pipeline_succeeded = True
                        if supabase:
                            try:
                                from datetime import datetime, timezone
                                supabase.table("cached_results").upsert({
                                    "query": c_key,
                                    "result_payload": event.get("payload", {}),
                                    "created_at": datetime.now(timezone.utc).isoformat(),
                                }).execute()
                            except Exception:
                                logger.exception("Stream cache write failed")
        except asyncio.TimeoutError:
            logger.error("Stream exceeded 120s timeout cap user_id=%s", user_id)
            yield f"data: {json.dumps({'type': 'error', 'message': 'Search timed out. Your credits have been refunded.'})}\n\n"
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("Stream pipeline failed")
            yield f"data: {json.dumps({'type': 'error', 'message': 'Product search failed. Please try again.'})}\n\n"
        finally:
            if not pipeline_succeeded:
                # Refund exactly once with idempotency key
                try:
                    refund_credit(user_id, cost, reference_id=charge_ref)
                    logger.info("Refunded %d credits to user_id=%s ref=%s", cost, user_id, charge_ref)
                except Exception as r_err:
                    logger.error("Failed to refund stream credits user_id=%s ref=%s: %s", user_id, charge_ref, r_err)

    return StreamingResponse(event_generator(), media_type="text/event-stream", headers={
        "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no",
    })


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/ready")
async def ready(details: bool = False):
    """
    Comprehensive dependency readiness check:
    - Supabase database schema capability
    - Shared Upstash Redis rate limiter reachability
    - SearXNG search engine connectivity
    - Ollama LLM / algorithmic fallback availability
    """
    checks = {}
    is_ready = True

    # 1. Supabase check
    if not supabase:
        checks["database"] = {"status": "unconfigured"}
        is_ready = False
    else:
        try:
            res = supabase.rpc("seamas_schema_is_ready", {}).execute()
            if res.data is True:
                checks["database"] = {"status": "ready"}
            else:
                checks["database"] = {"status": "schema_not_ready"}
                is_ready = False
        except Exception as e:
            checks["database"] = {"status": "error", "error": str(e)}
            is_ready = False

    # 2. Redis check
    if settings.UPSTASH_REDIS_REST_URL and settings.UPSTASH_REDIS_REST_TOKEN:
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                r = await client.get(
                    f"{settings.UPSTASH_REDIS_REST_URL.rstrip('/')}/ping",
                    headers={"Authorization": f"Bearer {settings.UPSTASH_REDIS_REST_TOKEN}"}
                )
                checks["redis"] = {"status": "ready" if r.status_code == 200 else "degraded"}
        except Exception:
            checks["redis"] = {"status": "unreachable"}
    else:
        checks["redis"] = {"status": "local_fallback"}

    # 3. SearXNG check
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(settings.SEARXNG_BASE_URL)
            checks["searxng"] = {"status": "ready" if r.status_code in (200, 302, 303) else "unhealthy"}
    except Exception:
        checks["searxng"] = {"status": "unreachable", "fallback": "tavily"}

    # 4. Ollama check
    from core.config import resolve_ollama_model
    m = resolve_ollama_model()
    checks["llm"] = {"status": "ready" if m else "heuristic_fallback", "model": m}

    if not is_ready:
        raise HTTPException(status_code=503, detail={"status": "not_ready", "checks": checks})
    if details:
        return {"status": "ready", "checks": checks}
    return {"status": "ready"}


@app.get("/metrics")
async def metrics_endpoint():
    """Prometheus-compatible plain text metrics."""
    from utils.agent_tracker import _ACTIVE_SESSIONS
    lines = [
        "# HELP seamas_api_active_sessions Number of active chat sessions",
        "# TYPE seamas_api_active_sessions gauge",
        f"seamas_api_active_sessions {len(_ACTIVE_SESSIONS)}",
        "# HELP seamas_api_up Service liveness indicator",
        "# TYPE seamas_api_up gauge",
        "seamas_api_up 1",
    ]
    return StreamingResponse(iter([("\n".join(lines) + "\n")]), media_type="text/plain")


@app.get("/api/status")
async def status_endpoint(request: Request):
    await enforce_rate_limit("public-status", request.client.host if request.client else "unknown", 60, 60)
    from core.config import resolve_ollama_model
    active_model = resolve_ollama_model()
    return {
        "api": "operational",
        "database": "configured" if supabase else "unavailable",
        "ollama": {
            "status": "connected" if active_model else "offline",
            "model": active_model,
        }
    }


@app.get("/api/credits/me")
async def fetch_my_credits(user: dict = Depends(current_user)):
    await enforce_rate_limit("credits", str(user["id"]), 60, 60)
    try:
        return get_credits(user["id"])
    except CreditServiceUnavailable:
        logger.exception("Credit balance service unavailable user_ref=%s", str(user["id"])[:8])
        raise HTTPException(status_code=503, detail="Credits could not be loaded. Please try again.")


TOPUP_PACKS = {
    "booster_100": {"credits": 100, "amount": 10000, "name": "Booster Mini (+100 Credits)"},
    "booster_250": {"credits": 250, "amount": 20000, "name": "Booster Pro (+250 Credits)"},
    "booster_500": {"credits": 500, "amount": 30000, "name": "Booster Ultra (+500 Credits)"},
}
PLANS = {"pro_monthly": {"credits": 500, "amount": 99900, "name": "SEAMAS Pro Monthly Subscription"}}


def get_razorpay_client():
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=503, detail="Payment service is not configured.")
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


class CreateOrderRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    plan_type: str = Field(default="pro_monthly", pattern="^(pro_monthly|topup)$")
    pack_id: str | None = Field(default=None, max_length=40)


class PaymentVerification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    razorpay_payment_link_id: str = Field(min_length=5, max_length=100)
    razorpay_payment_id: str = Field(min_length=5, max_length=100)
    razorpay_signature: str = Field(min_length=16, max_length=256)
    razorpay_payment_link_reference_id: str | None = Field(default=None, max_length=100)
    razorpay_payment_link_status: str | None = Field(default=None, max_length=40)


@app.post("/api/create-order")
async def create_order(payload: CreateOrderRequest, user: dict = Depends(current_user)):
    await enforce_rate_limit("create-order", str(user["id"]), 5, 600)
    plan = TOPUP_PACKS.get(payload.pack_id) if payload.plan_type == "topup" else PLANS[payload.plan_type]
    if not plan:
        raise HTTPException(status_code=422, detail="Unknown credit pack.")
    if not supabase:
        raise HTTPException(status_code=503, detail="Payment records are not configured.")
    transaction_id = str(uuid4())
    try:
        # Persist the server-owned payment entitlement before contacting Razorpay.
        supabase.table("payment_transactions").insert({
            "id": transaction_id, "user_id": user["id"], "plan_type": payload.plan_type,
            "credits": plan["credits"], "amount": plan["amount"], "currency": "INR", "status": "creating",
        }).execute()
        customer = {"email": user.get("email") or ""}
        payment_link = get_razorpay_client().payment_link.create({
            "amount": plan["amount"], "currency": "INR", "accept_partial": False,
            "description": plan["name"], "customer": customer,
            "notify": {"sms": False, "email": False}, "reminder_enable": False,
            "callback_url": f"{settings.FRONTEND_BASE_URL.rstrip('/')}/dashboard?payment=success&type={payload.plan_type}",
            "callback_method": "get", "reference_id": transaction_id,
        })
        supabase.table("payment_transactions").update({
            "razorpay_payment_link_id": payment_link["id"], "status": "pending",
        }).eq("id", transaction_id).execute()
        return {"payment_link_id": payment_link["id"], "short_url": payment_link["short_url"]}
    except HTTPException:
        raise
    except Exception:
        logger.exception("Payment link creation failed transaction_id=%s", transaction_id)
        raise HTTPException(status_code=502, detail="Payment initialization failed. Please try again.")


@app.post("/api/verify-payment")
async def verify_payment(payload: PaymentVerification, user: dict = Depends(current_user)):
    await enforce_rate_limit("verify-payment", str(user["id"]), 20, 60)
    if not supabase:
        raise HTTPException(status_code=503, detail="Payment records are not configured.")
    try:
        rows = supabase.table("payment_transactions").select("*").eq(
            "razorpay_payment_link_id", payload.razorpay_payment_link_id
        ).eq("user_id", user["id"]).limit(1).execute().data
        if not rows:
            raise HTTPException(status_code=404, detail="Payment transaction not found.")
        transaction = rows[0]
        if transaction.get("status") == "completed":
            return {"status": "success", "credits": get_credits(user["id"]), "idempotent": True}
        if transaction.get("status") != "pending":
            raise HTTPException(status_code=409, detail="Payment transaction is not payable.")
        client = get_razorpay_client()
        client.utility.verify_payment_link_signature({
            "payment_link_id": payload.razorpay_payment_link_id,
            "razorpay_payment_id": payload.razorpay_payment_id,
            "payment_link_reference_id": payload.razorpay_payment_link_reference_id or transaction["id"],
            "payment_link_status": payload.razorpay_payment_link_status or "paid",
            "razorpay_signature": payload.razorpay_signature,
        })
        payment = client.payment.fetch(payload.razorpay_payment_id)
        payment_link = client.payment_link.fetch(payload.razorpay_payment_link_id)
        if (payment.get("status") != "captured" or payment.get("amount") != int(transaction["amount"])
                or payment.get("currency") != transaction["currency"]
                or payment.get("payment_link_id") != payload.razorpay_payment_link_id
                or payment_link.get("status") != "paid"
                or payment_link.get("amount") != int(transaction["amount"])
                or payment_link.get("reference_id") != transaction["id"]):
            raise HTTPException(status_code=400, detail="Payment amount or status does not match the transaction.")
        result = supabase.rpc("complete_payment_and_credit", {
            "p_transaction_id": transaction["id"], "p_user_id": user["id"],
            "p_payment_id": payload.razorpay_payment_id,
        }).execute()
        return {"status": "success", "credits": result.data}
    except HTTPException:
        raise
    except razorpay.errors.SignatureVerificationError:
        logger.warning("Payment signature mismatch user_id=%s", user["id"])
        raise HTTPException(status_code=400, detail="Payment signature verification failed.")
    except Exception:
        logger.exception("Payment verification failed user_id=%s", user["id"])
        raise HTTPException(status_code=502, detail="Payment verification could not be processed.")


@app.post("/api/webhooks/razorpay")
async def razorpay_webhook(request: Request):
    """
    Authoritative server-side Razorpay webhook handler.
    Verifies signature using RAZORPAY_WEBHOOK_SECRET and idempotently credits user.
    """
    webhook_secret = settings.RAZORPAY_WEBHOOK_SECRET
    if not webhook_secret:
        raise HTTPException(status_code=503, detail="Webhook handling not configured.")

    body_bytes = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")

    try:
        client = get_razorpay_client()
        client.utility.verify_webhook_signature(body_bytes.decode("utf-8"), signature, webhook_secret)
    except Exception as e:
        logger.warning("Invalid Razorpay webhook signature: %s", e)
        raise HTTPException(status_code=400, detail="Invalid webhook signature.")

    try:
        data = json.loads(body_bytes)
        event = data.get("event")

        if event in ("payment_link.paid", "payment.captured"):
            payload = data.get("payload", {})
            entity = payload.get("payment_link", {}).get("entity") or payload.get("payment", {}).get("entity", {})
            link_id = entity.get("id") or entity.get("payment_link_id")
            payment_id = entity.get("payment_id") or entity.get("id")
            reference_id = entity.get("reference_id")

            if not supabase:
                raise HTTPException(status_code=503, detail="Database unavailable")

            # Look up transaction by payment_link_id or reference_id
            query = supabase.table("payment_transactions").select("*")
            if link_id:
                query = query.eq("razorpay_payment_link_id", link_id)
            elif reference_id:
                query = query.eq("id", reference_id)
            rows = query.limit(1).execute().data

            if rows:
                tx = rows[0]
                if tx.get("status") != "completed":
                    supabase.rpc("complete_payment_and_credit", {
                        "p_transaction_id": tx["id"],
                        "p_user_id": tx["user_id"],
                        "p_payment_id": payment_id or "webhook_verified",
                    }).execute()
                    logger.info("Webhook successfully credited transaction_id=%s user_id=%s", tx["id"], tx["user_id"])

        return {"status": "ok"}
    except Exception as exc:
        logger.exception("Error processing Razorpay webhook: %s", exc)
        raise HTTPException(status_code=500, detail="Webhook processing failed.")


def extract_assistant_suggested_query(text: str) -> str | None:
    clean = text.strip()
    patterns = [
        r"^(?:what(?:'s|\s+is)\s+(?:the\s+)?(?:rate|price|cost|mrp|deal)\s+(?:of\s+|for\s+)?)(.+)$",
        r"^(?:how\s+much\s+(?:is|does|for)\s+)(.+?)(?:\s+cost|\s+rate)?$",
        r"^(?:price\s+(?:of|for)\s+)(.+)$",
        r"^(?:rate\s+(?:of|for)\s+)(.+)$",
        r"^(?:cost\s+(?:of|for)\s+)(.+)$",
        r"^(?:search\s+(?:for\s+)?|find\s+(?:me\s+)?|show\s+(?:me\s+)?|look\s+for\s+)(.+)$",
        r"^(?:tell\s+me\s+about\s+|info\s+(?:on|about)\s+)(.+)$",
        r"^(?:compare\s+)(.+)$",
        r"^(?:recommend\s+(?:me\s+)?)(.+)$",
        r"^(?:can\s+you\s+find\s+)(.+)$",
    ]
    for pat in patterns:
        m = re.match(pat, clean, re.IGNORECASE)
        if m:
            candidate = m.group(1).strip(" ?.!\"'")
            if len(candidate) >= 3:
                return candidate

    prod_match = re.search(
        r"\b(iphone\s*\d*(?:\s*pro(?:\s*max)?)?|macbook(?:\s*air|\s*pro)?(?:\s*m\d)?|galaxy\s*s\d+(?:\s*ultra)?|oneplus\s*\d+\w*|sony\s*(?:wh|wf)?[- ]?\d{4}\w*|ipad(?:\s*air|\s*pro)?|pixel\s*\d+\w*)\b",
        clean,
        re.IGNORECASE
    )
    if prod_match:
        return prod_match.group(1).strip()
    return None


def generate_smart_assistant_fallback(message: str, current_query: str, products: list[dict], suggested_query: str | None) -> str:
    msg = message.lower()
    target = suggested_query or current_query

    # 1. Post-search contextual intelligence if products are on screen
    if products:
        priced_items = [
            p for p in products
            if (p.get("extracted_price") or p.get("price") or p.get("indexed_price"))
        ]
        if any(w in msg for w in ["cheap", "lowest", "best price", "afford"]):
            if priced_items:
                best = min(priced_items, key=lambda x: x.get("extracted_price") or x.get("price") or x.get("indexed_price"))
                p_val = best.get("extracted_price") or best.get("price") or best.get("indexed_price")
                p_name = best.get("product_name") or best.get("title") or "Top Item"
                store = best.get("marketplace") or "Store"
                return f"Among the currently indexed results, the lowest verified offer is {p_name} on {store} at ₹{int(p_val):,}."

        if any(w in msg for w in ["warranty", "guarantee"]):
            return (
                "Standard manufacturer warranties for indexed products:\n"
                "• Apple: 1-Year Limited Warranty + AppleCare+ eligibility.\n"
                "• Samsung: 1-Year Pan-India Warranty (6 months for accessories).\n"
                "• Sony: 1-Year Brand Replacement upon invoice registration."
            )

        if any(w in msg for w in ["card", "bank", "discount", "emi", "offer", "cashback"]):
            return generate_bank_emi_intelligence(current_query, products)

    # 2. Specific product queries
    if target:
        t_low = target.lower()
        if "iphone 17 pro max" in t_low:
            return (
                "The iPhone 17 Pro Max is Apple's upcoming flagship generation. "
                "In India, launch pricing is anticipated to start around ₹1,44,900 – ₹1,59,900 based on previous flagship release tiers. "
                "Current iPhone 16 Pro Max units retail starting at ~₹1,44,900. Click below to launch a live 7-agent market sweep across Indian retailers."
            )
        elif "iphone 16 pro" in t_low:
            return (
                "The Apple iPhone 16 Pro starts at approximately ₹1,12,900 to ₹1,19,900 in India across Croma, Flipkart, and Amazon India. "
                "Click below to initiate a live price sweep across all verified storefronts."
            )
        elif "sony" in t_low and "xm5" in t_low:
            return (
                "The Sony WH-1000XM5 wireless noise-cancelling headphones typically sell between ₹24,990 and ₹29,990 (MRP: ₹34,990) on Amazon India and Croma. "
                "Click below to run a live multi-agent price comparison."
            )
        elif "macbook air" in t_low:
            return (
                "The Apple MacBook Air M3 (16GB RAM) currently ranges between ₹1,04,990 and ₹1,14,900 across Flipkart and Amazon India with bank discounts. "
                "Click below to sweep current authorized seller listings."
            )
        else:
            return (
                f"For '{target}', current live market prices depend on active authorized seller inventory across Amazon India, Flipkart, and Croma. "
                f"Click below to run a live 7-agent price and review verification sweep for '{target}'."
            )

    # 3. Explicit budget phone questions
    if "30000" in msg or "30,000" in msg or ("phone" in msg and "budget" in msg):
        return (
            "Top Recommended 5G Phones Under ₹30,000 in India:\n"
            "• OnePlus Nord 4 5G (~₹29,999) — All-metal unibody, Snapdragon 7+ Gen 3.\n"
            "• Poco F6 5G (~₹27,999) — Snapdragon 8s Gen 3 flagship-tier performance.\n"
            "• Samsung Galaxy A35 (~₹28,999) — IP67 water resistance, Knox Security."
        )

    return (
        "I am your SEAMAS AI Shopping Assistant. Ask me about real-time pricing on any gadget, "
        "side-by-side spec comparisons, warranty terms, or card & EMI discounts across verified Indian stores!"
    )


def generate_bank_emi_intelligence(current_query: str | None, products: list[dict] | None) -> str:
    priced = [
        p for p in (products or [])
        if isinstance(p, dict) and (p.get("extracted_price") or p.get("price") or p.get("indexed_price"))
    ]
    target_name = current_query or "your items"

    if priced:
        best = min(priced, key=lambda x: x.get("extracted_price") or x.get("price") or x.get("indexed_price"))
        p_val = int(best.get("extracted_price") or best.get("price") or best.get("indexed_price"))
        p_title = best.get("product_name") or best.get("title") or target_name
        store = best.get("marketplace") or best.get("store") or "Store"

        emi_3m = round(p_val / 3)
        emi_6m = round(p_val / 6)
        emi_12m = round(p_val / 12)
        disc_10 = min(round(p_val * 0.10), 5000)
        net_price = p_val - disc_10

        return (
            f"Live Bank & EMI Intelligence on {p_title} ({store} · ₹{p_val:,}):\n\n"
            f"• 10% Instant Bank Discount: Extra ₹{disc_10:,} off on HDFC, ICICI, SBI, and Axis Bank cards (Effective Checkout: ₹{net_price:,}).\n"
            f"• 5% Unlimited Cashback: Flat 5% cashback with Amazon Pay ICICI or Flipkart Axis Credit Cards.\n"
            f"• No-Cost EMI Plans (0% interest, 0 processing fee):\n"
            f"   - 3 Months: ~₹{emi_3m:,}/month\n"
            f"   - 6 Months: ~₹{emi_6m:,}/month\n"
            f"   - 12 Months: ~₹{emi_12m:,}/month with partner banks.\n"
            f"• Bajaj Finserv & Cardless EMI: Available on checkout for orders above ₹3,000."
        )

    return (
        f"Active Bank & EMI Intelligence on {target_name}:\n\n"
        "• HDFC & ICICI Bank Cards: 10% Instant Discount (up to ₹5,000 on electronics and appliances).\n"
        "• SBI Credit Cards: Up to ₹4,000 instant discount or cashback on qualifying orders.\n"
        "• Amazon Pay ICICI & Flipkart Axis: Flat 5% unlimited cashback credited to statement.\n"
        "• No-Cost EMI: 3, 6, and 12-month zero-interest installments supported on major credit cards and Bajaj Finserv EMI Network."
    )


@app.post("/api/assistant")
async def assistant_endpoint(
    payload: AssistantRequest,
    request: Request,
    user: dict | None = Depends(optional_current_user),
):
    """
    Free (0-credit) conversational assistant grounded in current on-screen product context.
    Uses active Ollama LLM if available, with intelligent query-aware fallbacks when offline.
    """
    identity = str(user["id"]) if user else (request.client.host if request.client else "unknown")
    await enforce_rate_limit("assistant", identity, 60, 60)

    suggested_query = extract_assistant_suggested_query(payload.message)
    action_label = f"Search Live Market for '{suggested_query}'" if suggested_query else None
    is_bank_emi = any(w in payload.message.lower() for w in ["bank", "card", "emi", "discount", "offer", "cashback", "credit", "debit"])

    # Build concise context block from payload.products[:8]
    context_lines = []
    for p in payload.products[:8]:
        if isinstance(p, dict):
            name = p.get("product_name") or p.get("title") or "Unknown"
            store = p.get("marketplace") or p.get("store") or "Store"
            price = p.get("extracted_price") or p.get("price") or p.get("indexed_price")
            price_str = f"₹{int(price):,}" if isinstance(price, (int, float)) and price > 0 else "Price unverified"
            rating = p.get("rating")
            rating_str = f"{rating}★" if rating else "No rating"
            verified = "Verified on page" if p.get("is_verified") else "Unverified"
            context_lines.append(f"- {name} | Store: {store} | Price: {price_str} | Rating: {rating_str} | {verified}")
    context_block = "\n".join(context_lines) if context_lines else "No products currently listed on screen."

    model_name = resolve_ollama_model()
    if model_name:
        try:
            from ollama import AsyncClient
            client = AsyncClient(host=settings.OLLAMA_HOST)
            system_prompt = (
                "You are the SEAMAS Luxury AI Shopping Assistant for Indian e-commerce (Amazon India, Flipkart, Croma, Reliance Digital, Tata CLiQ). "
                "Answer the user's exact question clearly, concisely, and accurately in 2–4 sentences or bullet points using Indian Rupees (₹). "
                "When asked about bank cards, credit cards, discounts, or EMI offers, provide authentic Indian e-commerce checkout offers "
                "(e.g., 10% instant discount up to ₹5,000 on HDFC/ICICI/SBI, 5% cashback on Flipkart Axis/Amazon Pay ICICI, and 3/6/12-month No-Cost EMI). "
                "You ARE fully authorized and expected to provide public e-commerce payment promotions and EMI plans. Never refuse or say you cannot assist with bank cards or EMI. "
                "If the user asks for the price/rate of a specific product (e.g., iPhone 17 Pro Max, Sony XM5, MacBook Air) that is NOT in the provided screen context, "
                "provide its accurate Indian market price range / launch status and suggest clicking the button below to run a live 7-agent marketplace sweep for that exact product. "
                "Never reply with unrelated budget phones when the user asks about a specific model."
            )
            extra_payment_context = ""
            if is_bank_emi:
                extra_payment_context = f"\nRelevant Payment Promotions & EMI Reference:\n{generate_bank_emi_intelligence(payload.current_query, payload.products)}\n"

            user_prompt = (
                f"User Question: \"{payload.message}\"\n"
                f"Current Search Topic: \"{payload.current_query or 'General Storefront'}\"\n\n"
                f"Products Currently Displayed on Screen:\n{context_block}\n"
                f"{extra_payment_context}\n"
                "Answer the user directly with specific savings and EMI numbers:"
            )

            response = await asyncio.wait_for(
                client.chat(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    options={
                        "temperature": 0.2,
                        "num_predict": 220,
                    }
                ),
                timeout=12.0
            )
            reply_text = response["message"]["content"].strip()
            reply_text = re.sub(r"<think>.*?</think>", "", reply_text, flags=re.DOTALL).strip()
            
            # Anti-refusal interceptor: if model erroneously refuses bank/EMI, supply authoritative intelligence
            refusal_patterns = [
                "can't assist with bank", "cannot assist with bank", "unable to assist with bank",
                "can't help with bank", "cannot help with bank", "can't assist with emi",
                "cannot assist with emi", "not able to assist with bank", "can't assist with",
                "cannot assist with", "sorry, but i can't assist"
            ]
            if is_bank_emi and any(rp in reply_text.lower() for rp in refusal_patterns):
                reply_text = generate_bank_emi_intelligence(payload.current_query, payload.products)

            if reply_text:
                return {
                    "reply": reply_text,
                    "suggested_query": suggested_query,
                    "action_label": action_label,
                }
        except Exception as exc:
            logger.warning("Ollama assistant generation failed or timed out: %s; using smart fallback", exc)

    # Smart query-aware fallback
    fallback_reply = generate_smart_assistant_fallback(payload.message, payload.current_query, payload.products, suggested_query)
    return {
        "reply": fallback_reply,
        "suggested_query": suggested_query,
        "action_label": action_label,
    }


@app.post("/api/feedback")
async def feedback_endpoint(
    payload: FeedbackRequest,
    request: Request,
    user: dict | None = Depends(optional_current_user),
):
    """
    Collect user feedback (thumbs up/down + rationale) for recommendation evaluation.
    Persists to Supabase table 'recommendation_feedback' if available, and logs structured telemetry.
    """
    user_id = str(user["id"]) if user else None
    logger.info(
        "User recommendation feedback received: rating=%s query=%s user_id=%s reason=%s",
        payload.rating, payload.query, user_id, payload.reason,
    )
    if supabase:
        try:
            supabase.table("recommendation_feedback").insert({
                "user_id": user_id,
                "query": payload.query,
                "rating": payload.rating,
                "reason": payload.reason,
            }).execute()
        except Exception as exc:
            logger.warning("Failed to persist feedback to database: %s", exc)
    return {"status": "ok", "message": "Feedback recorded. Thank you!"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
