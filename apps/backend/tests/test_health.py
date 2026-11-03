import pytest


@pytest.mark.asyncio
async def test_health_returns_200(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_ready_with_postgres(client):
    """Requires reachable Postgres (CI service or local)."""
    response = await client.get("/ready")
    assert response.status_code == 200, response.text
    assert response.json()["status"] == "ready"
