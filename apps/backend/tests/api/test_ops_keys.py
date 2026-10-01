"""Ops signing-key endpoints require auth."""
from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_rotate_requires_auth(client: AsyncClient):
    r = await client.post("/api/v1/ops/signing-keys/rotate", json={"retire_after_hours": 24})
    assert r.status_code in (401, 403)


@pytest.mark.asyncio
async def test_prune_requires_auth(client: AsyncClient):
    r = await client.post("/api/v1/ops/signing-keys/prune")
    assert r.status_code in (401, 403)
