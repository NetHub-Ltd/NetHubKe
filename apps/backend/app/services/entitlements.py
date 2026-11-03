"""Product-scoped entitlement policy evaluation (N4). PostgreSQL is authoritative."""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from app.db.models.models import EntitlementOverride, Membership, Product, ProductLink, Service, Subscription
from app.utils.logging import logger

ENTITLEMENT_POLICIES = {"organization_only", "individual_only", "organization_or_individual", "organization_and_individual"}

async def check_entitled(db: AsyncSession, *, tenant_id: UUID, user_id: UUID, product: Product) -> bool:
    """Evaluate one user's grants for one product from durable PostgreSQL state."""
    if not product.is_active or product.deleted_at is not None:
        return False
    service = (await db.exec(select(Service).where(Service.slug == product.slug))).first()
    if service is not None and (not service.is_active or service.deleted_at is not None):
        logger.warning(f"entitlement denied: inactive service product={product.slug}")
        return False
    policy = (product.entitlement_policy or "").strip().lower()
    if policy not in ENTITLEMENT_POLICIES:
        logger.error(f"entitlement denied: invalid policy product={product.slug} policy={policy}")
        return False
    now = datetime.now(timezone.utc)
    subscription = (await db.exec(select(Subscription).where(
        Subscription.tenant_id == tenant_id, Subscription.product_id == product.id,
        Subscription.status.in_(("active", "trialing")),
        Subscription.current_period_start <= now, Subscription.current_period_end > now,
        Subscription.deleted_at.is_(None),
    ))).first()
    membership = (await db.exec(select(Membership).where(
        Membership.user_id == user_id, Membership.tenant_id == tenant_id,
        Membership.product_id == product.id, Membership.is_active == True,  # noqa: E712
        Membership.deleted_at.is_(None),
    ))).first()
    overrides = list(await db.exec(select(EntitlementOverride).where(
        EntitlementOverride.product_id == product.id, EntitlementOverride.tenant_id == tenant_id,
        EntitlementOverride.expires_at > now, EntitlementOverride.revoked_at.is_(None),
        EntitlementOverride.deleted_at.is_(None),
    )))
    org_grant = subscription is not None or any(row.user_id is None for row in overrides)
    individual_grant = membership is not None or any(row.user_id == user_id for row in overrides)
    allowed = {
        "organization_only": org_grant,
        "individual_only": individual_grant,
        "organization_or_individual": org_grant or individual_grant,
        "organization_and_individual": org_grant and individual_grant,
    }[policy]
    if not allowed:
        logger.info(f"entitlement denied tenant={tenant_id} user={user_id} product={product.slug} policy={policy}")
    return allowed

async def resolve_org_id(db: AsyncSession, *, tenant_id: UUID, product: Product,
                         tenant_tawala_org_id: Optional[UUID], tenant_id_fallback: UUID) -> UUID:
    """Resolve external product org only from an active explicit link or Tawala mapping."""
    link = (await db.exec(select(ProductLink).where(
        ProductLink.tenant_id == tenant_id, ProductLink.product_id == product.id,
        ProductLink.is_active == True,  # noqa: E712
        ProductLink.deleted_at.is_(None),
    ))).first()
    if link and link.external_org_id:
        return link.external_org_id
    if product.slug == "tawala" and tenant_tawala_org_id:
        return tenant_tawala_org_id
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"No active organization link is configured for product {product.slug}")

async def upsert_product_link(db: AsyncSession, *, tenant_id: UUID, product_slug: str,
                              external_org_id: UUID, actor_sub: str) -> ProductLink:
    """Upsert external org link and audit event atomically."""
    product = (await db.exec(select(Product).where(
        Product.slug == product_slug.strip().lower(), Product.deleted_at.is_(None)
    ))).first()
    if not product:
        raise HTTPException(status_code=404, detail=f"Unknown product: {product_slug}")
    if not product.is_active:
        raise HTTPException(status_code=403, detail=f"Product is not active: {product.slug}")
    existing = (await db.exec(select(ProductLink).where(
        ProductLink.tenant_id == tenant_id, ProductLink.product_id == product.id
    ))).first()
    if existing:
        existing.external_org_id, existing.is_active, existing.deleted_at = external_org_id, True, None
        db.add(existing)
        row, action = existing, "product_link.updated"
    else:
        row = ProductLink(tenant_id=tenant_id, product_id=product.id, external_org_id=external_org_id, is_active=True)
        db.add(row)
        action = "product_link.created"
    await db.flush()
    from app.db.models.models import SecurityAuditEvent
    db.add(SecurityAuditEvent(actor_sub=actor_sub, action=action, target_type="product_link",
        target_id=str(row.id), outcome="success",
        details={"tenant_id": str(tenant_id), "product": product.slug, "external_org_id": str(external_org_id)}))
    await db.commit()
    await db.refresh(row)
    return row
