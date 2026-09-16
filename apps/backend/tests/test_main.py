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
