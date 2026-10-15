"""Path A: membership model + access resolution (unit)."""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.db.models.models import Membership, Product
from app.db.schemas.schemas import TokenData
from app.services import access as access_svc


def test_membership_tablename_and_constraint():
    assert Membership.__tablename__ == "memberships"
    args = Membership.__table_args__
    assert args is not None


def test_product_model_still_service_agnostic():
    assert Product.__tablename__ == "products"


@pytest.mark.asyncio
async def test_resolve_access_unknown_product():
    db = AsyncMock()
    token = TokenData(
        sub="sub-1",
        email="a@example.com",
        username="a",
        full_name="A",
        scopes=["user:read"],
    )
    empty = MagicMock()
    empty.first = MagicMock(return_value=None)
    db.exec = AsyncMock(return_value=empty)

    with patch.object(
        access_svc.user_crud,
        "get_by_email",
        new_callable=AsyncMock,
        return_value=MagicMock(
            id=uuid4(), email="a@example.com", is_active=True, tenant_id=uuid4()
        ),
    ):
        with pytest.raises(HTTPException) as ei:
            await access_svc.resolve_product_access(
                db, token_data=token, product_slug="no-such-product"
            )
    assert ei.value.status_code == 404


@pytest.mark.asyncio
async def test_resolve_access_no_membership():
    db = AsyncMock()
    tid = uuid4()
    uid = uuid4()
    pid = uuid4()
    token = TokenData(
        sub="sub-1",
        email="a@example.com",
        username="a",
        full_name="A",
        scopes=["user:read"],
    )
    user = MagicMock(id=uid, email="a@example.com", is_active=True, tenant_id=tid)
    product = MagicMock(id=pid, slug="tawala-platform", is_active=True)

    # product found, membership missing
    def _exec_side_effect(stmt):
        result = MagicMock()
        # crude: first call product, second membership
        if not hasattr(_exec_side_effect, "n"):
            _exec_side_effect.n = 0
        _exec_side_effect.n += 1
        if _exec_side_effect.n == 1:
            result.first = MagicMock(return_value=product)
        else:
            result.first = MagicMock(return_value=None)
        return result

    db.exec = AsyncMock(side_effect=_exec_side_effect)

    with patch.object(
        access_svc.user_crud, "get_by_email", new_callable=AsyncMock, return_value=user
    ):
        with pytest.raises(HTTPException) as ei:
            await access_svc.resolve_product_access(
                db, token_data=token, product_slug="tawala-platform"
            )
    assert ei.value.status_code == 403
    assert "membership" in ei.value.detail.lower()


@pytest.mark.asyncio
async def test_resolve_access_happy_path():
    db = AsyncMock()
    tid = uuid4()
    uid = uuid4()
    pid = uuid4()
    ext_user = uuid4()
    ext_org = uuid4()
    token = TokenData(
        sub="idp-sub",
        email="ops@example.com",
        username="ops",
        full_name="Ops",
        scopes=["user:read"],
    )
    user = MagicMock(id=uid, email="ops@example.com", is_active=True, tenant_id=tid)
    product = MagicMock(id=pid, slug="tawala-platform", is_active=True)
    membership = MagicMock(
        user_id=uid,
        tenant_id=tid,
        product_id=pid,
        role="SUPER_ADMIN",
        external_user_id=ext_user,
        is_active=True,
    )
    tenant = MagicMock(id=tid, tawala_organization_id=None)

    calls = {"n": 0}

    def _exec_side_effect(stmt):
        calls["n"] += 1
        result = MagicMock()
        if calls["n"] == 1:
            result.first = MagicMock(return_value=product)
        elif calls["n"] == 2:
            result.first = MagicMock(return_value=membership)
        else:
            result.first = MagicMock(return_value=tenant)
        return result

    db.exec = AsyncMock(side_effect=_exec_side_effect)

    with patch.object(
        access_svc.user_crud, "get_by_email", new_callable=AsyncMock, return_value=user
    ):
        with patch.object(
            access_svc, "check_entitled", new_callable=AsyncMock, return_value=True
        ):
            with patch.object(
                access_svc, "resolve_org_id", new_callable=AsyncMock, return_value=ext_org
            ):
                principal = await access_svc.resolve_product_access(
                    db, token_data=token, product_slug="tawala-platform"
                )

    assert principal.user_id == uid
    assert principal.role == "SUPER_ADMIN"
    assert principal.external_user_id == ext_user
    assert principal.external_org_id == ext_org
    assert principal.product == "tawala-platform"
    assert principal.entitled is True
    assert principal.sub == "idp-sub"
