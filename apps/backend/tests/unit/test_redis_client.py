"""Redis client helpers — exercise success and failure paths without a live Redis."""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.core import redis_client as rc


def test_get_redis_singleton():
    # Reset module client
    rc._client = None
    mock_redis = MagicMock()
    with patch.object(rc.redis, "from_url", return_value=mock_redis) as fu:
        a = rc.get_redis()
        b = rc.get_redis()
    assert a is b is mock_redis
    fu.assert_called_once()
    rc._client = None  # cleanup


@pytest.mark.asyncio
async def test_redis_get_ok():
    mock = AsyncMock()
    mock.get = AsyncMock(return_value="val")
    with patch.object(rc, "get_redis", return_value=mock):
        assert await rc.redis_get("k") == "val"


@pytest.mark.asyncio
async def test_redis_get_error():
    mock = AsyncMock()
    mock.get = AsyncMock(side_effect=ConnectionError("down"))
    with patch.object(rc, "get_redis", return_value=mock):
        assert await rc.redis_get("k") is None


@pytest.mark.asyncio
async def test_redis_set_ok():
    mock = AsyncMock()
    mock.set = AsyncMock()
    with patch.object(rc, "get_redis", return_value=mock):
        await rc.redis_set("k", "v", 30)
    mock.set.assert_awaited()


@pytest.mark.asyncio
async def test_redis_set_error():
    mock = AsyncMock()
    mock.set = AsyncMock(side_effect=RuntimeError("x"))
    with patch.object(rc, "get_redis", return_value=mock):
        await rc.redis_set("k", "v", 30)  # should not raise


@pytest.mark.asyncio
async def test_redis_delete_ok():
    mock = AsyncMock()
    mock.delete = AsyncMock()
    with patch.object(rc, "get_redis", return_value=mock):
        await rc.redis_delete("a", "b")
    mock.delete.assert_awaited()


@pytest.mark.asyncio
async def test_redis_delete_empty():
    mock = AsyncMock()
    mock.delete = AsyncMock()
    with patch.object(rc, "get_redis", return_value=mock):
        await rc.redis_delete()
    mock.delete.assert_not_awaited()


def test_cache_key_constants():
    assert "jwks" in rc.JWKS_CACHE_KEY
    assert "kid" in rc.ACTIVE_KID_CACHE_KEY
