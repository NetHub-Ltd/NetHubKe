"""Billing read APIs — NetHub is system of record (N8)."""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlmodel import select

from app.api.deps import SessionDep, require_scopes
from app.crud.user import user_crud
from app.db.models.models import Invoice, Plan, Subscription
from app.db.schemas.schemas import TokenData

router = APIRouter()


class PlanRead(BaseModel):
    id: UUID
    name: str
    price: float
    currency: str
    interval: str
    features_config: dict = Field(default_factory=dict)


class SubscriptionRead(BaseModel):
    id: UUID
    status: str
    current_period_start: datetime
    current_period_end: datetime
    plan: Optional[PlanRead] = None


class InvoiceRead(BaseModel):
    id: UUID
    amount: float
    currency: str
    status: str
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    issued_at: Optional[datetime] = None
    paid_at: Optional[datetime] = None
    description: Optional[str] = None
    line_items: list = Field(default_factory=list)


class BillingSummary(BaseModel):
    """Tenant billing snapshot for the console."""

    subscription: Optional[SubscriptionRead] = None
    invoices: List[InvoiceRead] = Field(default_factory=list)


async def _tenant_id_for_user(db, token: TokenData) -> UUID:
    user = await user_crud.get_by_sub(db, token.sub)
    if not user or not user.tenant_id:
        raise HTTPException(status_code=404, detail="User or tenant not found")
    return user.tenant_id


@router.get("/summary", response_model=BillingSummary)
async def billing_summary(
    db: SessionDep,
    token_data: TokenData = Depends(require_scopes(["user:read"])),
) -> BillingSummary:
    """Current plan/subscription + recent invoices (read-only)."""
    tenant_id = await _tenant_id_for_user(db, token_data)

    subs = list(
        await db.exec(select(Subscription).where(Subscription.tenant_id == tenant_id))
    )
    # Prefer active/trialing, else most recently created
    sub = next((s for s in subs if s.status in ("active", "trialing")), None)
    if sub is None and subs:
        sub = max(subs, key=lambda s: s.created_at or s.id)

    sub_read: Optional[SubscriptionRead] = None
    if sub:
        plan_row = (
            await db.exec(select(Plan).where(Plan.id == sub.plan_id))
        ).first()
        plan_read = None
        if plan_row:
            plan_read = PlanRead(
                id=plan_row.id,
                name=plan_row.name,
                price=plan_row.price,
                currency=plan_row.currency,
                interval=plan_row.interval,
                features_config=plan_row.features_config or {},
            )
        sub_read = SubscriptionRead(
            id=sub.id,
            status=sub.status,
            current_period_start=sub.current_period_start,
            current_period_end=sub.current_period_end,
            plan=plan_read,
        )

    inv_rows = list(
        await db.exec(
            select(Invoice).where(
                Invoice.tenant_id == tenant_id,
                Invoice.deleted_at.is_(None),  # type: ignore[union-attr]
            )
        )
    )
    inv_rows = sorted(
        inv_rows,
        key=lambda i: i.issued_at or i.created_at or i.id,
        reverse=True,
    )[:50]
    invoices = [
        InvoiceRead(
            id=i.id,
            amount=i.amount,
            currency=i.currency,
            status=i.status,
            period_start=i.period_start,
            period_end=i.period_end,
            issued_at=i.issued_at,
            paid_at=i.paid_at,
            description=i.description,
            line_items=i.line_items or [],
        )
        for i in inv_rows
    ]
    return BillingSummary(subscription=sub_read, invoices=invoices)
