"""Organization subscriptions and entitlements (member-scoped)."""
from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request

from app.api.deps import SessionDep, get_current_user
from app.core.config import settings
from app.core.rate_limit import limiter
from app.crud import organizations as org_crud
from app.crud import subscriptions as sub_crud
from app.db.models.models import User
from app.db.schemas.schemas import (
    CapabilityRead,
    EntitlementsRead,
    SubscriptionRead,
)
from app.domain.subscriptions import is_subscription_effective

router = APIRouter(tags=["subscriptions"])
_limit = settings.rate_limit_user_routes


@router.get(
    "/organizations/{organization_id}/subscriptions",
    response_model=list[SubscriptionRead],
)
@limiter.limit(_limit)
async def list_subscriptions(
    request: Request,
    organization_id: uuid.UUID,
    session: SessionDep,
    user: Annotated[User, Depends(get_current_user)],
) -> list[SubscriptionRead]:
    await org_crud.require_active_membership(
        session, org_id=organization_id, user_id=user.id
    )
    rows = await sub_crud.list_org_subscriptions(session, organization_id)
    out: list[SubscriptionRead] = []
    for s in rows:
        data = SubscriptionRead.model_validate(s)
        data.effective = is_subscription_effective(
            status=s.status, current_period_end=s.current_period_end
        )
        out.append(data)
    return out


@router.get(
    "/organizations/{organization_id}/entitlements",
    response_model=EntitlementsRead,
)
@limiter.limit(_limit)
async def get_entitlements(
    request: Request,
    organization_id: uuid.UUID,
    session: SessionDep,
    user: Annotated[User, Depends(get_current_user)],
    product: str = Query(..., min_length=1, max_length=64),
) -> EntitlementsRead:
    await org_crud.require_active_membership(
        session, org_id=organization_id, user_id=user.id
    )
    sub = await sub_crud.get_subscription_for_org_product(
        session, org_id=organization_id, product=product
    )
    caps = await sub_crud.evaluate_entitlements(
        session, org_id=organization_id, product=product
    )
    effective = False
    status = None
    if sub:
        status = sub.status
        effective = is_subscription_effective(
            status=sub.status, current_period_end=sub.current_period_end
        )
    return EntitlementsRead(
        organization_id=organization_id,
        product=product,
        subscription_status=status,
        subscription_effective=effective,
        capabilities=[
            CapabilityRead(
                capability=c.capability,
                value_type=c.value_type,
                value=c.value,
                source=c.source,
            )
            for c in caps
        ],
    )
