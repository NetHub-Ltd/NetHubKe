import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_services_public(client: AsyncClient):
    r = await client.get("/api/v1/services/get-services")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_seed_requires_auth(client: AsyncClient):
    r = await client.post("/api/v1/services/seed-services")
    assert r.status_code in (401, 403)


@pytest.mark.asyncio
async def test_my_status_requires_auth(client: AsyncClient):
    r = await client.get("/api/v1/services/my-status")
    assert r.status_code in (401, 403)
