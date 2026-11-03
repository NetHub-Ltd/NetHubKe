import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_billing_summary_requires_auth(client: AsyncClient):
    r = await client.get("/api/v1/billing/summary")
    assert r.status_code in (401, 403)
