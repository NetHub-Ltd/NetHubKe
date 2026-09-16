"""Legacy auth negative tests kept for compatibility."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_users_me_rejects_garbage_bearer(client: AsyncClient):
    r = await client.get(
        "/api/v1/users/me", headers={"Authorization": "Bearer not-a-jwt"}
    )
    assert r.status_code == 401
