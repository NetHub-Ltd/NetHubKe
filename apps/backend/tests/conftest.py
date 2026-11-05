"""Shared fixtures — require env for Settings (CI injects Postgres service vars)."""
from __future__ import annotations

import os

import pytest
from httpx import ASGITransport, AsyncClient

# Ensure required settings exist before app import (CI + local defaults for tests)
_DEFAULTS = {
    "APP_NAME": "NetHubKe",
    "APP_VERSION": "0.1.0",
    "IMAGE_TAG": "test",
    "ENVIRONMENT": "development",
    "ALLOWED_ORIGINS": "http://localhost:3000",
    "FASTAPI_DB_USER": os.environ.get("FASTAPI_DB_USER", "nethub_ci"),
    "FASTAPI_DB_PASSWORD": os.environ.get("FASTAPI_DB_PASSWORD", "nethub_ci"),
    "FASTAPI_DB_HOST": os.environ.get("FASTAPI_DB_HOST", "localhost"),
    "FASTAPI_DB_PORT": os.environ.get("FASTAPI_DB_PORT", "5432"),
    "FASTAPI_DB_NAME": os.environ.get("FASTAPI_DB_NAME", "nethub_ci"),
    "OIDC_ISSUER": "https://idp.test/realms/nethub",
    "OIDC_JWKS_URL": "https://idp.test/realms/nethub/protocol/openid-connect/certs",
    "AUDIENCE": "nethub-api",
    "RATE_LIMIT_ENABLED": "false",
    "DIAGNOSTICS_ENABLED": "true",
}
for key, value in _DEFAULTS.items():
    os.environ.setdefault(key, value)

# Clear settings cache if already loaded
from app.core import config as config_module

config_module.get_settings.cache_clear()


@pytest.fixture
async def client():
    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
