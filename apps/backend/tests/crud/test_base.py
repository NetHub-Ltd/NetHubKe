"""BaseCRUD coverage."""
from __future__ import annotations

import uuid

import pytest
from fastapi import HTTPException

from app.crud.base import BaseCRUD
from app.db.models.models import Service
from app.db.schemas.schemas import ServiceCreateIn, ServiceUpdateIn


@pytest.mark.asyncio
async def test_base_crud_get_missing(db_session):
    crud = BaseCRUD(Service)
    row = await crud.get(db_session, uuid.uuid4())
    assert row is None


@pytest.mark.asyncio
async def test_base_crud_create_get_multi(db_session):
    crud = BaseCRUD[Service, ServiceCreateIn, ServiceUpdateIn](Service)
    payload = ServiceCreateIn(
        title="T",
        slug=f"s-{uuid.uuid4().hex[:8]}",
        short_desc="s",
        description="d",
        features=[],
        pricing=[],
    )
    created = await crud.create(db_session, obj_in=payload)
    assert created.id is not None
    assert created.slug == payload.slug

    rows = await crud.get_multi(db_session, skip=0, limit=10)
    assert any(r.id == created.id for r in rows)

    got = await crud.get(db_session, created.id)
    assert got is not None
    assert got.title == "T"


@pytest.mark.asyncio
async def test_base_crud_get_by_attributes(db_session):
    crud = BaseCRUD[Service, ServiceCreateIn, ServiceUpdateIn](Service)
    slug = f"attr-{uuid.uuid4().hex[:8]}"
    await crud.create(
        db_session,
        obj_in=ServiceCreateIn(
            title="A", slug=slug, short_desc="s", description="d", features=[], pricing=[]
        ),
    )
    rows = await crud.get_by_attributes(db_session, filters={"slug": slug})
    assert len(rows) == 1
    assert rows[0].slug == slug


@pytest.mark.asyncio
async def test_base_crud_invalid_filter_field(db_session):
    crud = BaseCRUD(Service)
    with pytest.raises(HTTPException) as ei:
        await crud.get_by_attributes(db_session, filters={"not_a_field": "x"})
    assert ei.value.status_code == 400


@pytest.mark.asyncio
async def test_base_crud_update_and_remove(db_session):
    crud = BaseCRUD[Service, ServiceCreateIn, ServiceUpdateIn](Service)
    created = await crud.create(
        db_session,
        obj_in=ServiceCreateIn(
            title="Old",
            slug=f"u-{uuid.uuid4().hex[:8]}",
            short_desc="s",
            description="d",
            features=[],
            pricing=[],
        ),
    )
    updated = await crud.update(
        db_session, db_obj=created, obj_in=ServiceUpdateIn(title="New")
    )
    assert updated.title == "New"

    # soft/hard remove depending on implementation
    if hasattr(crud, "remove"):
        await crud.remove(db_session, id=created.id)
        assert await crud.get(db_session, created.id) is None
