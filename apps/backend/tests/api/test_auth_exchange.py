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


@pytest.mark.asyncio
async def test_exchange_success_uses_server_resolved_identity_and_product_audience(
    client: AsyncClient,
    db_session,
    make_kc_token,
    patch_kc_decode,
    monkeypatch,
):
    """Exercise the enabled route against real test DB rows with external calls mocked."""
    import time
    import uuid

    from app.api.v1.routes import auth
    from app.db.models.models import Product, Tenant, User, UserIdentity
    from app.core.config import settings

    tenant = Tenant(name="Exchange Test Tenant", email=f"tenant-{uuid.uuid4()}@example.com")
    db_session.add(tenant)
    await db_session.flush()

    user = User(
        username=f"exchange-{uuid.uuid4().hex[:8]}",
        email=f"exchange-{uuid.uuid4().hex[:8]}@example.com",
        full_name="Exchange Test User",
        is_active=True,
        tenant_id=tenant.id,
    )
    product = Product(
        slug="tawala",
        name="Tawala",
        audience="tawala-api-db-row",
        is_active=True,
        claim_profile="tawala",
    )
    subject = f"exchange-{uuid.uuid4()}"
    db_session.add(user)
    db_session.add(UserIdentity(issuer=settings.idp_issuer, subject=subject, user_id=user.id))
    db_session.add(product)
    await db_session.commit()
    await db_session.refresh(user)
    await db_session.refresh(tenant)

    minted = AsyncMock(return_value=("signed-product-token", int(time.time()) + 60))
    monkeypatch.setattr(auth, "exchange_enabled", lambda: True)
    monkeypatch.setattr(auth, "check_entitled", AsyncMock(return_value=True))
    monkeypatch.setattr(auth, "resolve_org_id", AsyncMock(return_value=tenant.id))
    monkeypatch.setattr(auth, "mint_product_access_token", minted)

    token = make_kc_token(sub=subject, email=user.email, roles=["org_owner"])
    response = await client.post(
        "/api/v1/auth/exchange",
        headers={"Authorization": f"Bearer {token}"},
        json={"product": "tawala", "principal": "owner"},
    )

    assert response.status_code == 200, response.text
    payload = response.json()
    assert payload["access_token"] == "signed-product-token"
    assert payload["product"] == "tawala"
    assert payload["audience"] == "tawala-api"
    assert payload["principal"] == "owner"
    assert payload["org_id"] == str(tenant.id)
    minted.assert_awaited_once()
    entitlement = auth.check_entitled
    entitlement.assert_awaited_once()
    assert entitlement.await_args.kwargs["tenant_id"] == tenant.id
    assert entitlement.await_args.kwargs["user_id"] == user.id
    assert entitlement.await_args.kwargs["product"].id == product.id
    kwargs = minted.await_args.kwargs
    assert kwargs["product_slug"] == "tawala"
    assert kwargs["audience"] == "tawala-api"
    assert kwargs["sub"] == str(user.id)
    assert kwargs["org_id"] == tenant.id
    assert kwargs["principal"] == "owner"
    assert kwargs["email"] == user.email


@pytest.mark.asyncio
async def test_exchange_rejects_client_principal_elevation_before_database_access(
    client: AsyncClient, make_kc_token, patch_kc_decode, monkeypatch
):
    from app.api.v1.routes import auth

    monkeypatch.setattr(auth, "exchange_enabled", lambda: True)
    monkeypatch.setattr(
        auth,
        "ensure_tawala_product",
        AsyncMock(side_effect=AssertionError("should reject before product lookup")),
    )
    token = make_kc_token(email="non-owner@example.com", roles=["user"])
    response = await client.post(
        "/api/v1/auth/exchange",
        headers={"Authorization": f"Bearer {token}"},
        json={"product": "tawala", "principal": "owner"},
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "principal is derived by NetHubKe and cannot be overridden"


@pytest.mark.asyncio
async def test_exchange_rejects_inactive_local_user(
    client: AsyncClient, db_session, make_kc_token, patch_kc_decode, monkeypatch
):
    import uuid

    from app.api.v1.routes import auth
    from app.db.models.models import Product, Tenant, User, UserIdentity
    from app.core.config import settings

    tenant = Tenant(name="Inactive User Tenant", email=f"tenant-{uuid.uuid4()}@example.com")
    db_session.add(tenant)
    await db_session.flush()
    user = User(
        username=f"inactive-{uuid.uuid4().hex[:8]}",
        email=f"inactive-{uuid.uuid4().hex[:8]}@example.com",
        full_name="Inactive User",
        is_active=False,
        tenant_id=tenant.id,
    )
    subject = f"inactive-{uuid.uuid4()}"
    db_session.add(user)
    db_session.add(UserIdentity(issuer=settings.idp_issuer, subject=subject, user_id=user.id))
    db_session.add(Product(
        slug="tawala", name="Tawala", audience="tawala-api",
        is_active=True, claim_profile="tawala",
    ))
    await db_session.commit()

    monkeypatch.setattr(auth, "exchange_enabled", lambda: True)
    entitlement = AsyncMock(return_value=True)
    monkeypatch.setattr(auth, "check_entitled", entitlement)
    response = await client.post(
        "/api/v1/auth/exchange",
        headers={"Authorization": f"Bearer {make_kc_token(sub=subject, email=user.email)}"},
        json={"product": "tawala"},
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "Account is disabled"
    entitlement.assert_not_awaited()


@pytest.mark.asyncio
async def test_exchange_rejects_user_without_tenant(
    client: AsyncClient, db_session, make_kc_token, patch_kc_decode, monkeypatch
):
    import uuid

    from app.api.v1.routes import auth
    from app.db.models.models import Product, User, UserIdentity
    from app.core.config import settings

    user = User(
        username=f"orphan-{uuid.uuid4().hex[:8]}",
        email=f"orphan-{uuid.uuid4().hex[:8]}@example.com",
        full_name="Unlinked User",
        is_active=True,
        tenant_id=None,
    )
    subject = f"orphan-{uuid.uuid4()}"
    db_session.add(user)
    db_session.add(UserIdentity(issuer=settings.idp_issuer, subject=subject, user_id=user.id))
    db_session.add(Product(
        slug="tawala", name="Tawala", audience="tawala-api",
        is_active=True, claim_profile="tawala",
    ))
    await db_session.commit()

    monkeypatch.setattr(auth, "exchange_enabled", lambda: True)
    response = await client.post(
        "/api/v1/auth/exchange",
        headers={"Authorization": f"Bearer {make_kc_token(sub=subject, email=user.email)}"},
        json={"product": "tawala"},
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "User is not linked to a tenant"


@pytest.mark.asyncio
async def test_exchange_fails_closed_when_entitlement_denied(
    client: AsyncClient, db_session, make_kc_token, patch_kc_decode, monkeypatch
):
    import uuid

    from app.api.v1.routes import auth
    from app.db.models.models import Product, Tenant, User, UserIdentity
    from app.core.config import settings

    tenant = Tenant(name="Unentitled Tenant", email=f"tenant-{uuid.uuid4()}@example.com")
    db_session.add(tenant)
    await db_session.flush()
    user = User(
        username=f"unentitled-{uuid.uuid4().hex[:8]}",
        email=f"unentitled-{uuid.uuid4().hex[:8]}@example.com",
        full_name="Unentitled User",
        is_active=True,
        tenant_id=tenant.id,
    )
    subject = f"unentitled-{uuid.uuid4()}"
    db_session.add(user)
    db_session.add(UserIdentity(issuer=settings.idp_issuer, subject=subject, user_id=user.id))
    db_session.add(Product(
        slug="tawala", name="Tawala", audience="tawala-api",
        is_active=True, claim_profile="tawala",
    ))
    await db_session.commit()

    monkeypatch.setattr(auth, "exchange_enabled", lambda: True)
    monkeypatch.setattr(auth, "check_entitled", AsyncMock(return_value=False))
    mint = AsyncMock()
    monkeypatch.setattr(auth, "mint_product_access_token", mint)
    response = await client.post(
        "/api/v1/auth/exchange",
        headers={"Authorization": f"Bearer {make_kc_token(sub=subject, email=user.email)}"},
        json={"product": "tawala"},
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "Tenant is not entitled to tawala"
    mint.assert_not_awaited()


@pytest.mark.asyncio
async def test_exchange_unknown_product_returns_404(
    client: AsyncClient, make_kc_token, patch_kc_decode, monkeypatch
):
    from app.api.v1.routes import auth

    monkeypatch.setattr(auth, "exchange_enabled", lambda: True)
    response = await client.post(
        "/api/v1/auth/exchange",
        headers={"Authorization": f"Bearer {make_kc_token()}"},
        json={"product": "unknown-product"},
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Unknown product: unknown-product"
