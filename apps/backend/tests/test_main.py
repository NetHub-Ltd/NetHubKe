"""App-level smoke tests."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check_endpoint(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_api_v1_prefix_exists(client: AsyncClient):
    response = await client.get("/api/v1/services/get-services")
    assert response.status_code == 200



@pytest.mark.asyncio
async def test_readiness_does_not_depend_on_redis(monkeypatch):
    from unittest.mock import AsyncMock, MagicMock

    from app import main

    session = AsyncMock()
    manager = MagicMock()
    manager.__aenter__ = AsyncMock(return_value=session)
    manager.__aexit__ = AsyncMock(return_value=None)
    monkeypatch.setattr(main, "AsyncSessionLocal", lambda: manager)

    response = await main.readiness_check()

    assert response.status_code == 200
    assert session.exec.await_count == 2


@pytest.mark.asyncio
async def test_startup_does_not_require_redis(monkeypatch):
    from unittest.mock import AsyncMock, MagicMock

    from fastapi import FastAPI

    from app import main
    from app.services import product_tokens

    session = AsyncMock()
    result = MagicMock()
    result.one.return_value = (1,)
    session.exec = AsyncMock(return_value=result)
    manager = MagicMock()
    manager.__aenter__ = AsyncMock(return_value=session)
    manager.__aexit__ = AsyncMock(return_value=None)
    close_redis = AsyncMock()

    monkeypatch.setattr(main, "AsyncSessionLocal", lambda: manager)
    monkeypatch.setattr(product_tokens, "exchange_enabled", lambda: False)
    monkeypatch.setattr(main, "close_redis", close_redis)

    async with main.lifespan(FastAPI()):
        pass

    close_redis.assert_awaited_once()
