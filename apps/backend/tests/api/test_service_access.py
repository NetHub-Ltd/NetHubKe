"""HTTP tests for authoritative service access decisions."""
from __future__ import annotations

from uuid import uuid4

import pytest
from httpx import AsyncClient

from app.core.config import settings
from app.db.models.models import Membership, Product, Service, Tenant, User, UserIdentity


async def _canonical_user(db_session, *, subject: str):
    tenant = Tenant(
        name=f"Access Tenant {uuid4().hex[:8]}",
        email=f"{uuid4()}@example.com",
    )
    db_session.add(tenant)
    await db_session.flush()

    user = User(
        username=f"access-{uuid4().hex[:8]}",
        email=f"{uuid4()}@example.com",
        full_name="Access Test User",
        is_active=True,
        tenant_id=tenant.id,
    )
    db_session.add(user)
    await db_session.flush()

    db_session.add(
        UserIdentity(
            issuer=settings.idp_issuer.rstrip("/"),
            subject=subject,
            user_id=user.id,
        )
    )
    await db_session.commit()
    return user, tenant


def _headers(make_kc_token, *, subject: str, email: str, scopes: str = "openid user:read"):
    token = make_kc_token(sub=subject, email=email, scopes=scopes)
    return {"Authorization": f"Bearer {token}"}


def _product(*, slug: str, policy: str = "individual_only", active: bool = True) -> Product:
    return Product(
        slug=slug,
        name=f"Product {slug}",
        audience=f"aud-{uuid4().hex}",
        entitlement_policy=policy,
        is_active=active,
    )


@pytest.mark.asyncio
async def test_service_access_allows_existing_individual_entitlement(
    client: AsyncClient, db_session, make_kc_token, patch_kc_decode
):
    subject = f"subject-{uuid4()}"
    user, tenant = await _canonical_user(db_session, subject=subject)
    product = _product(slug=f"product-{uuid4().hex[:8]}")
    db_session.add(product)
    await db_session.flush()
    db_session.add(
        Membership(
            user_id=user.id,
            tenant_id=tenant.id,
            product_id=product.id,
            role="member",
            is_active=True,
        )
    )
    await db_session.commit()

    response = await client.get(
        f"/api/v1/services/{product.slug}/access",
        headers=_headers(make_kc_token, subject=subject, email=user.email),
    )

    assert response.status_code == 200, response.text
    assert response.json() == {
        "slug": product.slug,
        "allowed": True,
        "reason_code": "allowed",
    }


@pytest.mark.asyncio
async def test_service_access_denies_when_no_entitlement_exists(
    client: AsyncClient, db_session, make_kc_token, patch_kc_decode
):
    subject = f"subject-{uuid4()}"
    user, _tenant = await _canonical_user(db_session, subject=subject)
    product = _product(slug=f"product-{uuid4().hex[:8]}")
    db_session.add(product)
    await db_session.commit()

    response = await client.get(
        f"/api/v1/services/{product.slug}/access",
        headers=_headers(make_kc_token, subject=subject, email=user.email),
    )

    assert response.status_code == 200, response.text
    assert response.json() == {
        "slug": product.slug,
        "allowed": False,
        "reason_code": "not_entitled",
    }


@pytest.mark.asyncio
async def test_service_access_does_not_use_another_tenant_membership(
    client: AsyncClient, db_session, make_kc_token, patch_kc_decode
):
    subject = f"subject-{uuid4()}"
    user, _tenant = await _canonical_user(db_session, subject=subject)
    other_tenant = Tenant(
        name=f"Other Tenant {uuid4().hex[:8]}",
        email=f"{uuid4()}@example.com",
    )
    product = _product(slug=f"product-{uuid4().hex[:8]}")
    db_session.add_all([other_tenant, product])
    await db_session.flush()
    db_session.add(
        Membership(
            user_id=user.id,
            tenant_id=other_tenant.id,
            product_id=product.id,
            role="member",
            is_active=True,
        )
    )
    await db_session.commit()

    response = await client.get(
        f"/api/v1/services/{product.slug}/access",
        headers=_headers(make_kc_token, subject=subject, email=user.email),
    )

    assert response.status_code == 200, response.text
    assert response.json()["allowed"] is False


@pytest.mark.asyncio
async def test_service_access_denies_inactive_service_even_with_membership(
    client: AsyncClient, db_session, make_kc_token, patch_kc_decode
):
    subject = f"subject-{uuid4()}"
    user, tenant = await _canonical_user(db_session, subject=subject)
    slug = f"product-{uuid4().hex[:8]}"
    product = _product(slug=slug)
    service = Service(
        title="Inactive service",
        slug=slug,
        icon="wrench",
        is_active=False,
        short_desc="Inactive",
        description="Inactive service",
    )
    db_session.add_all([product, service])
    await db_session.flush()
    db_session.add(
        Membership(
            user_id=user.id,
            tenant_id=tenant.id,
            product_id=product.id,
            role="member",
            is_active=True,
        )
    )
    await db_session.commit()

    response = await client.get(
        f"/api/v1/services/{slug}/access",
        headers=_headers(make_kc_token, subject=subject, email=user.email),
    )

    assert response.status_code == 200, response.text
    assert response.json()["allowed"] is False


@pytest.mark.asyncio
async def test_service_access_requires_user_read_scope(
    client: AsyncClient, db_session, make_kc_token, patch_kc_decode
):
    subject = f"subject-{uuid4()}"
    user, _tenant = await _canonical_user(db_session, subject=subject)
    product = _product(slug=f"product-{uuid4().hex[:8]}")
    db_session.add(product)
    await db_session.commit()

    response = await client.get(
        f"/api/v1/services/{product.slug}/access",
        headers=_headers(
            make_kc_token,
            subject=subject,
            email=user.email,
            scopes="openid profile email",
        ),
    )

    assert response.status_code == 403, response.text


@pytest.mark.asyncio
async def test_service_access_returns_not_found_for_unknown_product(
    client: AsyncClient, db_session, make_kc_token, patch_kc_decode
):
    subject = f"subject-{uuid4()}"
    user, _tenant = await _canonical_user(db_session, subject=subject)

    response = await client.get(
        f"/api/v1/services/unknown-{uuid4().hex}/access",
        headers=_headers(make_kc_token, subject=subject, email=user.email),
    )

    assert response.status_code == 404, response.text
