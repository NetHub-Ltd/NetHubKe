"""App factory and lifecycle — must start and respond to probes."""
from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient


@pytest.mark.asyncio
async def test_create_application_exports_app():
    from app.main import app, create_application

    assert app is not None
    rebuilt = create_application()
    assert rebuilt.title


@pytest.mark.asyncio
async def test_startup_lifespan_and_health(client):
    """Lifespan runs via ASGI; health is always 200."""
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    # security headers
    assert response.headers.get("x-content-type-options") == "nosniff"
    assert response.headers.get("x-frame-options") == "DENY"


@pytest.mark.asyncio
async def test_ready_with_postgres(client):
    response = await client.get("/ready")
    assert response.status_code == 200, response.text
    assert response.json()["status"] == "ready"


@pytest.mark.asyncio
async def test_diagnostics_payload(client):
    response = await client.get("/diagnostics")
    assert response.status_code == 200
    body = response.json()
    assert "oidc_issuer" in body
    assert "audiences" in body
    assert "jwks_url" in body
    assert "rate_limit_enabled" in body


@pytest.mark.asyncio
async def test_openapi_available(client):
    response = await client.get("/openapi.json")
    assert response.status_code == 200
    paths = response.json().get("paths", {})
    assert "/api/v1/users/me" in paths
    assert "/health" in paths
