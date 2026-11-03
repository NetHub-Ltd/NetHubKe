"""Smoke: import app and hit /health via ASGI (no external server required)."""
from __future__ import annotations

import asyncio
import sys

from httpx import ASGITransport, AsyncClient


async def main() -> int:
    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
    if response.status_code != 200:
        print(f"health failed: {response.status_code} {response.text}", file=sys.stderr)
        return 1
    if response.json().get("status") != "healthy":
        print(f"unexpected body: {response.text}", file=sys.stderr)
        return 1
    print("startup_ok")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
