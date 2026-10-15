import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app, extract_assistant_suggested_query, generate_smart_assistant_fallback


def test_extract_assistant_suggested_query():
    assert extract_assistant_suggested_query("what is the rate of iphone 17 pro max") == "iphone 17 pro max"
    assert extract_assistant_suggested_query("what's the price of Sony WH-1000XM5") == "Sony WH-1000XM5"
    assert extract_assistant_suggested_query("how much is MacBook Air M3") == "MacBook Air M3"
    assert extract_assistant_suggested_query("cost of Samsung Galaxy S24 Ultra") == "Samsung Galaxy S24 Ultra"
    assert extract_assistant_suggested_query("hello") is None


def test_generate_smart_assistant_fallback_specific_iphone():
    fallback = generate_smart_assistant_fallback(
        message="what is the rate of iphone 17 pro max",
        current_query="",
        products=[],
        suggested_query="iphone 17 pro max"
    )
    assert "iPhone 17 Pro Max" in fallback
    assert "₹30,000" not in fallback
    assert "OnePlus Nord 4" not in fallback


def test_generate_smart_assistant_fallback_budget_request():
    fallback = generate_smart_assistant_fallback(
        message="recommend phones under 30000",
        current_query="",
        products=[],
        suggested_query=None
    )
    assert "₹30,000" in fallback
    assert "OnePlus Nord 4" in fallback


@pytest.mark.asyncio
async def test_assistant_endpoint_direct_call():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/assistant", json={
            "message": "what is the rate of iphone 17 pro max",
            "current_query": "",
            "products": []
        })
        assert res.status_code == 200
        data = res.json()
        assert "reply" in data
        assert "iPhone 17 Pro Max" in data["reply"]
        assert data["suggested_query"] == "iphone 17 pro max"
        assert "Search Live Market for 'iphone 17 pro max'" in data["action_label"]
        assert "OnePlus Nord" not in data["reply"]


@pytest.mark.asyncio
async def test_assistant_endpoint_bank_emi_offers():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/assistant", json={
            "message": "Best bank card & EMI offers",
            "current_query": "Sansui TV 55 inch",
            "products": [
                {
                    "product_name": "Sansui 55 Inch 4K Ultra HD Smart TV",
                    "marketplace": "Amazon",
                    "price": 18059,
                    "extracted_price": 18059
                }
            ]
        })
        assert res.status_code == 200
        data = res.json()
        assert "reply" in data
        reply = data["reply"].lower()
        # Must NOT contain refusal
        assert "can't assist" not in reply
        assert "cannot assist" not in reply
        # Must contain bank/EMI details
        assert ("emi" in reply or "bank" in reply or "hdfc" in reply or "discount" in reply)

