"""Auth negative paths and public vs protected route matrix."""

import pytest
from httpx import AsyncClient
from unittest.mock import patch

from app.core.config import settings
from app.core import security


@pytest.mark.asyncio
async def test_health_is_public(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json().get("status") == "healthy"


@pytest.mark.asyncio
async def test_get_services_is_public(client: AsyncClient):
    response = await client.get("/api/v1/services/get-services")
    # 200 with list (possibly empty) — must not be 401
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_users_me_requires_auth(client: AsyncClient):
    response = await client.get("/api/v1/users/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_users_me_rejects_garbage_bearer(client: AsyncClient):
    response = await client.get(
        "/api/v1/users/me",
        headers={"Authorization": "Bearer not-a-jwt"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_users_sync_requires_auth(client: AsyncClient):
    response = await client.post("/api/v1/users/sync")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_users_patch_requires_auth(client: AsyncClient):
    response = await client.patch(
        "/api/v1/users/me",
        json={"full_name": "Nobody"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_seed_services_requires_auth(client: AsyncClient):
    response = await client.post("/api/v1/services/seed-services")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_service_requires_auth(client: AsyncClient):
    response = await client.post(
        "/api/v1/services/create-service",
        json={
            "title": "x",
            "slug": "x-test",
            "icon": "Search",
            "short_desc": "x",
            "description": "x",
            "features": [],
            "pricing": [],
            "faqs": [],
        },
    )
    assert response.status_code in (401, 422)  # 401 auth first; 422 if body validated first
    # Prefer auth: if 422, still ensure not 200
    assert response.status_code != 200


def test_decode_token_uses_settings_audience():
    """Audience passed to jwt.decode must be settings.audience (not a hardcoded string)."""
    captured = {}

    class _FakeKey:
        key = "secret"

    class _FakeClient:
        def get_signing_key_from_jwt(self, token):
            return _FakeKey()

    def fake_decode(token, key, algorithms=None, audience=None, issuer=None, leeway=None):
        captured["audience"] = audience
        captured["issuer"] = issuer
        raise security.exceptions.InvalidAudienceError("aud")

    with patch.object(security, "PyJWKClient", return_value=_FakeClient()):
        with patch.object(security.jwt, "decode", side_effect=fake_decode):
            with pytest.raises(Exception):
                security._decode_token("header.payload.sig")

    assert captured.get("audience") == settings.audience
