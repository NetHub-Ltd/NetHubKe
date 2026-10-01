"""Entitlement cache key + decision helpers."""
from __future__ import annotations
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest

from app.services import entitlements as ent
from app.db.models.models import ProductLink


def test_entitle_cache_key_format():
    tid = uuid4()
    key = ent._entitle_cache_key(tid, "tawala")
    assert key == f"nethub:as:entitle:{tid}:tawala"


def test_product_link_tablename():
    assert ProductLink.__tablename__ == "product_links"


@pytest.mark.asyncio
async def test_check_entitled_from_cache_hit_true():
    db = AsyncMock()
    tid = uuid4()
    with patch.object(ent, "redis_get", new_callable=AsyncMock, return_value="1"):
        assert await ent.check_entitled(db, tenant_id=tid, product_slug="tawala") is True


@pytest.mark.asyncio
async def test_check_entitled_from_cache_hit_false():
    db = AsyncMock()
    tid = uuid4()
    with patch.object(ent, "redis_get", new_callable=AsyncMock, return_value="0"):
        assert await ent.check_entitled(db, tenant_id=tid, product_slug="tawala") is False


@pytest.mark.asyncio
async def test_check_entitled_computes_when_require_off():
    db = AsyncMock()
    tid = uuid4()
    with patch.object(ent, "redis_get", new_callable=AsyncMock, return_value=None):
        with patch.object(ent, "redis_set", new_callable=AsyncMock) as rs:
            with patch.object(
                ent.settings, "tawala_exchange_require_subscription", False
            ):
                ok = await ent.check_entitled(db, tenant_id=tid, product_slug="tawala")
    assert ok is True
    rs.assert_awaited()


@pytest.mark.asyncio
async def test_resolve_org_id_prefers_link():
    db = AsyncMock()
    tid = uuid4()
    ext = uuid4()
    product = MagicMock()
    product.id = uuid4()
    product.slug = "tawala"
    link = MagicMock()
    link.external_org_id = ext
    result = MagicMock()
    result.first = MagicMock(return_value=link)
    db.exec = AsyncMock(return_value=result)
    org = await ent.resolve_org_id(
        db,
        tenant_id=tid,
        product=product,
        tenant_tawala_org_id=uuid4(),
        tenant_id_fallback=tid,
    )
    assert org == ext


@pytest.mark.asyncio
async def test_resolve_org_id_falls_back_to_tenant():
    db = AsyncMock()
    tid = uuid4()
    product = MagicMock()
    product.id = uuid4()
    product.slug = "other"
    result = MagicMock()
    result.first = MagicMock(return_value=None)
    db.exec = AsyncMock(return_value=result)
    org = await ent.resolve_org_id(
        db,
        tenant_id=tid,
        product=product,
        tenant_tawala_org_id=None,
        tenant_id_fallback=tid,
    )
    assert org == tid
