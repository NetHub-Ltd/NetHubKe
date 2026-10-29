"""N1 exchange/JWKS API regressions; deterministic, no live IdP dependency."""
from __future__ import annotations

from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException
from httpx import AsyncClient

from app.db.schemas.schemas import TokenData


@pytest.mark.asyncio
async def test_jwks_endpoint_returns_public_jwks_shape(client: AsyncClient, monkeypatch):
    from app.api.v1.routes import auth

    monkeypatch.setattr(
        auth,
        "build_jwks_document",
        AsyncMock(return_value={"keys": [{
            "kty": "RSA", "use": "sig", "alg": "RS256",
            "kid": "public-key-1", "n": "modulus", "e": "AQAB",
        }]}),
    )
    response = await client.get("/api/v1/auth/jwks.json")
    assert response.status_code == 200
    document = response.json()
    assert isinstance(document["keys"], list)
    assert len(document["keys"]) == 1
    key = document["keys"][0]
    assert {"kty", "use", "alg", "kid", "n", "e"} <= key.keys()
    assert not ({"d", "p", "q", "dp", "dq", "qi", "oth", "private_pem"} & key.keys())


@pytest.mark.asyncio
async def test_exchange_tawala_disabled_returns_503(
    client: AsyncClient, make_kc_token, patch_kc_decode, monkeypatch
):
    from app.api.v1.routes import auth

    monkeypatch.setattr(auth, "exchange_enabled", lambda: False)
    response = await client.post(
        "/api/v1/auth/exchange/tawala",
        headers={"Authorization": f"Bearer {make_kc_token()}"},
    )
    assert response.status_code == 503
    assert response.json()["detail"] == "Token exchange is not enabled"


@pytest.mark.asyncio
async def test_exchange_generic_disabled_returns_503(
    client: AsyncClient, make_kc_token, patch_kc_decode, monkeypatch
):
    from app.api.v1.routes import auth

    monkeypatch.setattr(auth, "exchange_enabled", lambda: False)
    response = await client.post(
        "/api/v1/auth/exchange",
        headers={"Authorization": f"Bearer {make_kc_token()}"},
        json={"product": "tawala"},
    )
    assert response.status_code == 503
    assert response.json()["detail"] == "Token exchange is not enabled"


@pytest.mark.asyncio
async def test_exchange_missing_bearer_returns_401(client: AsyncClient):
    response = await client.post("/api/v1/auth/exchange", json={"product": "tawala"})
    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "Bearer"


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "body",
    [{}, {"product": ""}, {"product": "x" * 65}],
)
async def test_exchange_rejects_invalid_product_body(
    client: AsyncClient, body: dict, make_kc_token, patch_kc_decode
):
    response = await client.post(
        "/api/v1/auth/exchange",
        headers={"Authorization": f"Bearer {make_kc_token()}"},
        json=body,
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_disabled_exchange_has_no_database_or_signing_side_effects(
    make_kc_token, patch_kc_decode, monkeypatch
):
    from app.api.v1.routes import auth

    db = AsyncMock()
    token_data = TokenData(
        sub="stable-subject",
        email="user@example.com",
        preferred_username="user",
        name="Test User",
        email_verified=True,
        roles=["user"],
        scope="",
    )
    monkeypatch.setattr(auth, "exchange_enabled", lambda: False)
    monkeypatch.setattr(auth, "ensure_tawala_product", AsyncMock(side_effect=AssertionError("DB side effect")))
    monkeypatch.setattr(auth, "get_product_by_slug", AsyncMock(side_effect=AssertionError("product lookup")))
    monkeypatch.setattr(auth, "mint_product_access_token", AsyncMock(side_effect=AssertionError("key/mint")))
    with pytest.raises(HTTPException) as error:
        await auth._run_exchange(
            db, token_data, product_slug="tawala", principal_override=None
        )
    assert error.value.status_code == 503
    db.exec.assert_not_awaited()
    db.add.assert_not_called()
    db.commit.assert_not_awaited()


def test_client_cannot_elevate_principal():
    from app.api.v1.routes.auth import _validate_principal_hint

    token_data = TokenData(
        sub="subject",
        email="user@example.com",
        preferred_username="user",
        name="Test User",
        email_verified=True,
        roles=["user"],
        scope="",
    )
    with pytest.raises(HTTPException) as error:
        _validate_principal_hint(token_data, "owner")
    assert error.value.status_code == 403
    assert _validate_principal_hint(token_data, "terminal") == "terminal"


def test_owner_principal_must_come_from_verified_roles():
    from app.api.v1.routes.auth import _validate_principal_hint

    token_data = TokenData(
        sub="subject",
        email="owner@example.com",
        preferred_username="owner",
        name="Owner",
        email_verified=True,
        roles=["org_owner"],
        scope="",
    )
    assert _validate_principal_hint(token_data, None) == "owner"
    with pytest.raises(HTTPException) as error:
        _validate_principal_hint(token_data, "terminal")
    assert error.value.status_code == 403


@pytest.mark.asyncio
async def test_product_links_requires_auth(client: AsyncClient):
    response = await client.get("/api/v1/users/me/product-links")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_jwks_with_malformed_env_pem_still_200(
    client: AsyncClient, monkeypatch
):
    """Regression: non-PEM TAWALA_JWT_PRIVATE_KEY must not 500 JWKS."""
    from app.core import config as config_module
    from app.services import tawala_token as tt

    async def no_cache(_key):
        return None

    monkeypatch.setattr(config_module.settings, "tawala_jwt_private_key", "TEST_NON_PEM_ENV_VALUE_NOT_A_SECRET")
    monkeypatch.setattr(tt.settings, "tawala_jwt_private_key", "TEST_NON_PEM_ENV_VALUE_NOT_A_SECRET")
    monkeypatch.setattr(tt, "redis_get", no_cache)
    monkeypatch.setattr(tt, "redis_set", AsyncMock())

    response = await client.get("/api/v1/auth/jwks.json")
    assert response.status_code == 200, response.text
    document = response.json()
    assert isinstance(document.get("keys"), list)
    for key in document["keys"]:
        assert not ({"d", "p", "q", "dp", "dq", "qi", "oth", "private_pem"} & key.keys())
