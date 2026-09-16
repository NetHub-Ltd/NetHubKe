"""Auth exchange + JWKS (N3 generic product parameter)."""
from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_jwks_endpoint(client: AsyncClient):
    r = await client.get("/api/v1/auth/jwks.json")
    assert r.status_code == 200
    data = r.json()
    assert "keys" in data


@pytest.mark.asyncio
async def test_exchange_tawala_disabled_by_default(
    client: AsyncClient, make_kc_token, patch_kc_decode
):
    token = make_kc_token()
    r = await client.post(
        "/api/v1/auth/exchange/tawala",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code in (503, 401, 404)


@pytest.mark.asyncio
async def test_exchange_generic_disabled_by_default(
    client: AsyncClient, make_kc_token, patch_kc_decode
):
    token = make_kc_token()
    r = await client.post(
        "/api/v1/auth/exchange",
        headers={"Authorization": f"Bearer {token}"},
        json={"product": "tawala"},
    )
    assert r.status_code in (503, 401, 404)


@pytest.mark.asyncio
async def test_exchange_generic_requires_product_body(
    client: AsyncClient, make_kc_token, patch_kc_decode
):
    token = make_kc_token()
    r = await client.post(
        "/api/v1/auth/exchange",
        headers={"Authorization": f"Bearer {token}"},
        json={},
    )
    # Validation error when product missing
    assert r.status_code in (422, 400, 503)


@pytest.mark.asyncio
async def test_exchange_unknown_product_when_enabled(
    client: AsyncClient, make_kc_token, patch_kc_decode, monkeypatch
):
    from app.core import config as config_module
    from app.services import tawala_token as tt

    monkeypatch.setattr(tt, "exchange_enabled", lambda: True)
    monkeypatch.setattr(config_module.settings, "tawala_exchange_enabled", True)

    token = make_kc_token()
    r = await client.post(
        "/api/v1/auth/exchange",
        headers={"Authorization": f"Bearer {token}"},
        json={"product": "does-not-exist-xyz"},
    )
    # May 404 product, or 404 user not synced first depending on order
    assert r.status_code in (404, 403, 503)


@pytest.mark.asyncio
async def test_product_links_requires_auth(client: AsyncClient):
    r = await client.get("/api/v1/users/me/product-links")
    assert r.status_code in (401, 403)


@pytest.mark.asyncio
async def test_jwks_with_malformed_env_pem_still_200(
    client: AsyncClient, monkeypatch
):
    """Regression: non-PEM TAWALA_JWT_PRIVATE_KEY must not 500 JWKS."""
    from app.core import config as config_module
    from app.services import tawala_token as tt

    monkeypatch.setattr(
        config_module.settings,
        "tawala_jwt_private_key",
        "TEST_NON_PEM_ENV_VALUE_NOT_A_SECRET",
    )
    monkeypatch.setattr(
        tt.settings,
        "tawala_jwt_private_key",
        "TEST_NON_PEM_ENV_VALUE_NOT_A_SECRET",
    )
    # Ensure cache miss path hits env fallback
    async def _no_cache(_key):
        return None

    monkeypatch.setattr(tt, "redis_get", _no_cache)

    r = await client.get("/api/v1/auth/jwks.json")
    assert r.status_code == 200, r.text
    body = r.json()
    assert "keys" in body
    assert isinstance(body["keys"], list)

