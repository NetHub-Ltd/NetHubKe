"""Startup readiness helpers (mocked)."""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.core import redis_client as rc


@pytest.mark.asyncio
async def test_ensure_redis_ready_ok():
    client = AsyncMock()
    client.ping = AsyncMock(return_value=True)
    with patch.object(rc, "get_redis", return_value=client):
        await rc.ensure_redis_ready(timeout_sec=1.0)
    client.ping.assert_awaited()


@pytest.mark.asyncio
async def test_ensure_redis_ready_fails_hard():
    client = AsyncMock()
    client.ping = AsyncMock(side_effect=ConnectionError("refused"))
    with patch.object(rc, "get_redis", return_value=client):
        with pytest.raises(RuntimeError, match="Redis unavailable"):
            await rc.ensure_redis_ready(timeout_sec=1.0)


@pytest.mark.asyncio
async def test_ensure_signing_keys_ready_bootstraps_when_empty():
    from app.services import tawala_token as tt

    db = AsyncMock()
    result = MagicMock()
    result.first = MagicMock(return_value=None)
    db.exec = AsyncMock(return_value=result)
    fake = MagicMock()
    fake.kid = "new-kid"
    fake.status = "active"
    with patch.object(tt, "ensure_fresh_signing_key", new_callable=AsyncMock):
        with patch.object(
            tt, "bootstrap_signing_key", new_callable=AsyncMock, return_value=fake
        ) as boot:
            row = await tt.ensure_signing_keys_ready(db)
    assert row.kid == "new-kid"
    boot.assert_awaited()
