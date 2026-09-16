"""Smoke + basic coverage for services and tenants CRUD modules."""
from __future__ import annotations

import uuid

import pytest

from app.crud import services as services_crud_mod
from app.crud import tenants as tenants_crud_mod
from app.db.schemas.schemas import ServiceCreateIn, TenantCreate


def test_services_crud_module():
    assert services_crud_mod.service_crud is not None


def test_tenants_crud_module():
    assert tenants_crud_mod.tenant_crud is not None


@pytest.mark.asyncio
async def test_tenant_crud_create_get(db_session):
    crud = tenants_crud_mod.tenant_crud
    # Tenant model requires email + name
    from app.db.models.models import Tenant

    t = Tenant(name="Acme", email=f"acme-{uuid.uuid4().hex[:8]}@test.local")
    db_session.add(t)
    await db_session.commit()
    await db_session.refresh(t)

    got = await crud.get(db_session, t.id)
    assert got is not None
    assert got.name == "Acme"


@pytest.mark.asyncio
async def test_service_crud_by_slug(db_session):
    crud = services_crud_mod.service_crud
    slug = f"svc-{uuid.uuid4().hex[:8]}"
    created = await crud.create(
        db_session,
        obj_in=ServiceCreateIn(
            title="Svc",
            slug=slug,
            short_desc="s",
            description="d",
            features=[],
            pricing=[],
        ),
    )
    found = await crud.get_service_by_slug(slug, db_session)
    assert found is not None
    assert found.id == created.id
