import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_jwks_endpoint(client: AsyncClient):
    r = await client.get("/api/v1/auth/jwks.json")
    assert r.status_code == 200
    data = r.json()
    assert "keys" in data


@pytest.mark.asyncio
async def test_exchange_disabled_by_default(client: AsyncClient, make_kc_token, patch_kc_decode):
    token = make_kc_token()
    r = await client.post(
        "/api/v1/auth/exchange/tawala",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code in (503, 401, 404)
