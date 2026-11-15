"""Plans, subscriptions, entitlements, payment events."""
from __future__ import annotations

import hashlib
import hmac
import json
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.config import get_settings, settings
from app.crud import audit as audit_crud
from app.db.models.models import (
    EntitlementOverride,
    PaymentEvent,
    Plan,
    PlanEntitlement,
    Subscription,
)
from app.domain.subscriptions import (
    CapabilityValue,
    is_subscription_effective,
    merge_entitlements,
    next_period_end,
    trial_window,
    utcnow,
)


def _utcnow() -> datetime:
    return utcnow()


async def list_active_plans(
    session: AsyncSession, *, product: str | None = None
) -> list[Plan]:
    q = select(Plan).where(Plan.is_active == True)  # noqa: E712
    if product:
        q = q.where(Plan.product == product)
    q = q.order_by(Plan.product, Plan.code)
    result = await session.exec(q)
    return list(result.all())


async def get_plan_by_code(
    session: AsyncSession, *, product: str, code: str
) -> Plan | None:
    result = await session.exec(
        select(Plan).where(Plan.product == product, Plan.code == code)
    )
    return result.first()


async def get_plan(session: AsyncSession, plan_id: uuid.UUID) -> Plan | None:
    result = await session.exec(select(Plan).where(Plan.id == plan_id))
    return result.first()


async def list_plan_entitlements(
    session: AsyncSession, plan_id: uuid.UUID
) -> list[PlanEntitlement]:
    result = await session.exec(
        select(PlanEntitlement).where(PlanEntitlement.plan_id == plan_id)
    )
    return list(result.all())


async def get_subscription_for_org_product(
    session: AsyncSession, *, org_id: uuid.UUID, product: str
) -> Subscription | None:
    result = await session.exec(
        select(Subscription).where(
            Subscription.organization_id == org_id,
            Subscription.product == product,
        )
    )
    return result.first()


async def list_org_subscriptions(
    session: AsyncSession, org_id: uuid.UUID
) -> list[Subscription]:
    result = await session.exec(
        select(Subscription)
        .where(Subscription.organization_id == org_id)
        .order_by(Subscription.product)
    )
    return list(result.all())


async def grant_trial_subscription(
    session: AsyncSession,
    *,
    org_id: uuid.UUID,
    product: str,
    plan: Plan,
    actor_user_id: uuid.UUID | None,
) -> Subscription:
    existing = await get_subscription_for_org_product(
        session, org_id=org_id, product=product
    )
    if existing and existing.status in {"trial", "active"}:
        raise HTTPException(status_code=409, detail="Subscription already active")
    now = _utcnow()
    period_start, trial_end = trial_window(now, plan.trial_days or 14)
    period_end = trial_end or next_period_end(period_start, days=14)
    if existing:
        existing.plan_id = plan.id
        existing.status = "trial"
        existing.current_period_start = period_start
        existing.current_period_end = period_end
        existing.trial_end = trial_end
        existing.cancel_at_period_end = False
        existing.canceled_at = None
        existing.updated_at = now
        session.add(existing)
        sub = existing
    else:
        sub = Subscription(
            organization_id=org_id,
            product=product,
            plan_id=plan.id,
            status="trial",
            current_period_start=period_start,
            current_period_end=period_end,
            trial_end=trial_end,
        )
        session.add(sub)
    await session.flush()
    await audit_crud.record_event(
        session,
        action="subscription.trial_grant",
        actor_user_id=actor_user_id,
        target_type="subscription",
        target_id=str(sub.id),
        organization_id=org_id,
        detail={"product": product, "plan": plan.code},
        commit=False,
    )
    await session.commit()
    await session.refresh(sub)
    return sub


async def activate_or_renew_from_payment(
    session: AsyncSession,
    *,
    org_id: uuid.UUID,
    product: str,
    plan: Plan,
    period_days: int = 30,
) -> tuple[Subscription, str]:
    """Activate or renew subscription after verified payment. Returns (sub, effect)."""
    now = _utcnow()
    existing = await get_subscription_for_org_product(
        session, org_id=org_id, product=product
    )
    period_end = next_period_end(now, days=period_days)
    if existing is None:
        sub = Subscription(
            organization_id=org_id,
            product=product,
            plan_id=plan.id,
            status="active",
            current_period_start=now,
            current_period_end=period_end,
            trial_end=None,
        )
        session.add(sub)
        await session.flush()
        return sub, "activated"
    # Idempotent renew: if already active and period covers same end window, still extend once per event
    effect = "renewed" if existing.status in {"trial", "active", "past_due"} else "activated"
    existing.plan_id = plan.id
    existing.status = "active"
    existing.current_period_start = now
    existing.current_period_end = period_end
    existing.trial_end = None
    existing.cancel_at_period_end = False
    existing.canceled_at = None
    existing.updated_at = now
    session.add(existing)
    await session.flush()
    return existing, effect


async def evaluate_entitlements(
    session: AsyncSession,
    *,
    org_id: uuid.UUID,
    product: str,
    now: datetime | None = None,
) -> list[CapabilityValue]:
    """Request-time entitlement snapshot for org+product."""
    n = now or _utcnow()
    sub = await get_subscription_for_org_product(session, org_id=org_id, product=product)
    plan_rows: list[tuple[str, str, str]] = []
    if sub and is_subscription_effective(
        status=sub.status,
        current_period_end=sub.current_period_end,
        now=n,
    ):
        ents = await list_plan_entitlements(session, sub.plan_id)
        plan_rows = [(e.capability, e.value_type, e.value) for e in ents]

    result = await session.exec(
        select(EntitlementOverride).where(
            EntitlementOverride.organization_id == org_id,
            EntitlementOverride.product == product,
            EntitlementOverride.is_active == True,  # noqa: E712
        )
    )
    overrides = []
    for o in result.all():
        ef = o.effective_from
        if ef.tzinfo is None:
            ef = ef.replace(tzinfo=timezone.utc)
        if ef > n:
            continue
        if o.effective_until is not None:
            eu = o.effective_until
            if eu.tzinfo is None:
                eu = eu.replace(tzinfo=timezone.utc)
            if eu <= n:
                continue
        overrides.append((o.capability, o.value_type, o.value))

    return merge_entitlements(plan_rows, overrides)


def verify_webhook_signature(*, body: bytes, signature_header: str | None) -> bool:
    secret = (get_settings().payment_webhook_secret or "").encode("utf-8")
    if not secret or not signature_header:
        return False
    provided = signature_header.strip()
    if provided.startswith("sha256="):
        provided = provided[7:]
    digest = hmac.new(secret, body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(digest, provided)


def payload_hash(body: bytes) -> str:
    return hashlib.sha256(body).hexdigest()


async def process_payment_webhook(
    session: AsyncSession,
    *,
    provider: str,
    body: bytes,
    signature_header: str | None,
    payload: dict,
) -> PaymentEvent:
    """
    Verify signature, enforce idempotency, apply subscription effect in one transaction.
    Never stores raw card data — only hashed payload and non-sensitive fields.
    """
    valid_sig = verify_webhook_signature(body=body, signature_header=signature_header)
    if not valid_sig:
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    provider_event_id = str(payload.get("event_id") or "").strip()
    idempotency_key = str(payload.get("idempotency_key") or provider_event_id).strip()
    if not provider_event_id or not idempotency_key:
        raise HTTPException(status_code=400, detail="event_id and idempotency_key required")

    # Duplicate short-circuit
    existing = await session.exec(
        select(PaymentEvent).where(
            PaymentEvent.provider == provider,
            PaymentEvent.provider_event_id == provider_event_id,
        )
    )
    found = existing.first()
    if found is not None:
        return found

    existing_idem = await session.exec(
        select(PaymentEvent).where(PaymentEvent.idempotency_key == idempotency_key)
    )
    found_idem = existing_idem.first()
    if found_idem is not None:
        return found_idem

    org_id_raw = payload.get("organization_id")
    product = str(payload.get("product") or "").strip()
    plan_code = str(payload.get("plan_code") or "").strip()
    event_type = str(payload.get("event_type") or "payment.succeeded").strip()
    amount_cents = int(payload.get("amount_cents") or 0)
    currency = str(payload.get("currency") or "KES").strip()[:8]

    try:
        org_id = uuid.UUID(str(org_id_raw)) if org_id_raw else None
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid organization_id") from exc

    event = PaymentEvent(
        provider=provider,
        provider_event_id=provider_event_id,
        idempotency_key=idempotency_key,
        event_type=event_type,
        organization_id=org_id,
        product=product,
        plan_code=plan_code,
        amount_cents=amount_cents,
        currency=currency,
        payload_hash=payload_hash(body),
        signature_valid=True,
        processing_result="pending",
        detail="",
    )
    session.add(event)
    try:
        await session.flush()
    except IntegrityError:
        await session.rollback()
        # race: return existing
        again = await session.exec(
            select(PaymentEvent).where(
                PaymentEvent.provider == provider,
                PaymentEvent.provider_event_id == provider_event_id,
            )
        )
        row = again.first()
        if row:
            return row
        raise

    if event_type not in {"payment.succeeded", "subscription.renewed"}:
        event.processing_result = "ignored"
        event.processed_at = _utcnow()
        session.add(event)
        await session.commit()
        await session.refresh(event)
        return event

    if org_id is None or not product or not plan_code:
        event.processing_result = "failed"
        event.detail = "missing organization_id, product, or plan_code"
        event.processed_at = _utcnow()
        session.add(event)
        await session.commit()
        await session.refresh(event)
        return event

    plan = await get_plan_by_code(session, product=product, code=plan_code)
    if plan is None or not plan.is_active:
        event.processing_result = "failed"
        event.detail = "unknown or inactive plan"
        event.processed_at = _utcnow()
        session.add(event)
        await session.commit()
        await session.refresh(event)
        return event

    sub, effect = await activate_or_renew_from_payment(
        session, org_id=org_id, product=product, plan=plan
    )
    event.subscription_id = sub.id
    event.processing_result = effect
    event.processed_at = _utcnow()
    session.add(event)
    await audit_crud.record_event(
        session,
        action=f"subscription.{effect}",
        actor_type="system",
        target_type="subscription",
        target_id=str(sub.id),
        organization_id=org_id,
        detail={"provider": provider, "event_id": provider_event_id, "plan": plan_code},
        commit=False,
    )
    await session.commit()
    await session.refresh(event)
    return event


async def seed_default_plans(session: AsyncSession) -> None:
    """Idempotent seed of example plans for local/dev (no-op if any plan exists)."""
    existing = await session.exec(select(Plan).limit(1))
    if existing.first():
        return
    plans = [
        ("tawala", "starter", "Tawala Starter", 14, [("tawala.inventory.view", "boolean", "true"), ("tawala.inventory.manage", "boolean", "false")]),
        ("tawala", "pro", "Tawala Pro", 14, [("tawala.inventory.view", "boolean", "true"), ("tawala.inventory.manage", "boolean", "true"), ("tawala.reports.view", "boolean", "true")]),
        ("netpay", "starter", "NetPay Starter", 7, [("netpay.payments.accept", "boolean", "true"), ("netpay.payouts.manage", "boolean", "false")]),
        ("netpay", "pro", "NetPay Pro", 7, [("netpay.payments.accept", "boolean", "true"), ("netpay.payouts.manage", "boolean", "true")]),
    ]
    for product, code, name, trial, ents in plans:
        plan = Plan(
            product=product,
            code=code,
            name=name,
            description=f"{name} plan",
            is_active=True,
            trial_days=trial,
        )
        session.add(plan)
        await session.flush()
        for cap, vtype, val in ents:
            session.add(
                PlanEntitlement(
                    plan_id=plan.id, capability=cap, value_type=vtype, value=val
                )
            )
    await session.commit()
