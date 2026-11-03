import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_me_requires_auth(client: AsyncClient):
    r = await client.get("/api/v1/users/me")
    assert r.status_code in (401, 403)


@pytest.mark.asyncio
async def test_sync_requires_auth(client: AsyncClient):
    r = await client.post("/api/v1/users/sync")
    assert r.status_code in (401, 403)


@pytest.mark.asyncio
async def test_patch_requires_auth(client: AsyncClient):
    r = await client.patch("/api/v1/users/me", json={"full_name": "X"})
    assert r.status_code in (401, 403)
