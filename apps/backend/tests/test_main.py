import pytest
from httpx import AsyncClient
from app.core.config import settings


@pytest.mark.asyncio
async def test_cors_headers_middleware(client: AsyncClient):
    """
    Verifies that CORSMiddleware is active.
    FastAPI returns 400 if the Origin is not in the allowed list or if
    the preflight request is malformed.
    """
    # Use an origin that we know is in your .env
    origin = (
        settings.cors_origins[0] if settings.cors_origins else "http://localhost:3000"
    )

    headers = {
        "Origin": origin,
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "Content-Type",
    }

    response = await client.options("/", headers=headers)

    # If this still fails with 400, ensure 'http://localhost:3000'
    # is exactly what is returned by settings.cors_origins
    assert response.status_code in [200, 204]
    assert response.headers.get("access-control-allow-origin") == origin


@pytest.mark.asyncio
async def test_global_exception_handler(client: AsyncClient):
    response = await client.get("/__test_crash__")

    assert response.status_code == 500
    assert response.json()["detail"] == "Internal Server Error"


@pytest.mark.asyncio
async def test_api_v1_prefix_exists(client: AsyncClient):
    """
    Ensures the api_router is correctly included with the prefix.
    """
    # Testing the prefix defined in settings (e.g., /api/v1)
    prefix = settings.API_V1_STR
    response = await client.get(f"{prefix}/services/filtered")

    # We expect a 200 (empty list) or 401/404 based on route logic,
    # but the prefix itself must be valid.
    assert response.status_code != 404


@pytest.mark.asyncio
async def test_docs_url_availability(client: AsyncClient):
    """
    Verifies that the docs URL is available in non-production environments.
    """
    if settings.ENVIRONMENT != "production":
        response = await client.get("/docs")
        assert response.status_code == 200
    else:
        response = await client.get("/docs")
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_seed_data_endpoint(client: AsyncClient):
    """
    Tests the /seed_data endpoint to ensure it triggers the seeding process.
    Note: This will actually seed the database, so use with caution.
    """
    response = await client.get("/seed_data")
    assert response.status_code == 200
    assert response.json()["detail"] == "Data seeding initiated"


@pytest.mark.asyncio
async def test_health_check_endpoint(client: AsyncClient):
    """
    Verifies the deep health check endpoint.
    Ensures API is up and database connectivity works.
    """
    response = await client.get("/health")
    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "healthy"
    assert data["database"] == "connected"

    # Version should exist, but don't hard-fail on exact value
    assert "version" in data
    assert isinstance(data["version"], str)
