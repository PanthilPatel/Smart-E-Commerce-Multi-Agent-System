"""
Manual integration smoke test script for SEAMAS API.
Run manually when backend server is running: python test_backend.py
"""
import asyncio
import httpx
import json

async def run_smoke_test():
    async with httpx.AsyncClient(timeout=300.0) as client:
        res = await client.post("http://localhost:8000/api/chat", json={"query": "Pentonic B RT Ball Pens, Blue Ink, 3 Pens Blister Set, Pack of 3"})
        with open("out.json", "w", encoding="utf-8") as f:
            json.dump(res.json(), f, indent=2)
        print("Success")

if __name__ == "__main__":
    asyncio.run(run_smoke_test())
