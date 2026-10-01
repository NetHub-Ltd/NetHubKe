"""Tenant ↔ product entitlement checks with Redis cache (N4)."""
from __future__ import annotations

from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.config import settings
from app.core.redis_client import redis_get, redis_set, redis_delete
from app.db.models.models import Product, ProductLink, Service, Subscription
from app.utils.logging import logger

ENTITLE_TTL_SEC = 120


def _entitle_cache_key(tenant_id: UUID, product_slug: str) -> str:
    return f"nethub:as:entitle:{tenant_id}:{product_slug}"


async def invalidate_entitlement_cache(tenant_id: UUID, product_slug: str) -> None:
    await redis_delete(_entitle_cache_key(tenant_id, product_slug))


async def check_entitled(
    db: AsyncSession,
    *,
    tenant_id: UUID,
    product_slug: str,
) -> bool:
    """
    Return whether tenant may exchange tokens for product.

    - Cached in Redis as nethub:as:entitle:{tenant}:{product} ("1" / "0")
    - When tawala_exchange_require_subscription is false: allow (still requires active product)
    - When true: fail closed unless an active subscription path is found (or service missing → allow with warning for now)
    """
    key = _entitle_cache_key(tenant_id, product_slug)
    cached = await redis_get(key)
    if cached is not None:
        return cached == "1"

    entitled = await _compute_entitled(db, tenant_id=tenant_id, product_slug=product_slug)
    await redis_set(key, "1" if entitled else "0", ENTITLE_TTL_SEC)
    return entitled


async def _compute_entitled(
    db: AsyncSession,
    *,
    tenant_id: UUID,
    product_slug: str,
) -> bool:
    # Master exchange flag handled by caller; this is product entitlement only
    require = bool(getattr(settings, "tawala_exchange_require_subscription", False))
    if product_slug == "tawala" and not require:
        return True
    if not require:
        return True

    # Fail-closed path: require active service catalog entry; subscriptions optional until N8
    svc = (
        await db.exec(
            select(Service).where(
                Service.slug == product_slug,
                Service.is_active == True,  # noqa: E712
            )
        )
    ).first()
    if not svc:
        logger.warning(
            f"entitlement fail-closed: no active service slug={product_slug} tenant={tenant_id}"
        )
        return False

    # If any active subscription exists for tenant, treat as entitled (plans link later)
    subs = (
        await db.exec(
            select(Subscription).where(Subscription.tenant_id == tenant_id)
        )
    ).all()
    sub = next((s for s in subs if s.status in ("active", "trialing")), None)
    if sub:
        return True

    logger.info(f"entitlement denied tenant={tenant_id} product={product_slug}")
    return False


async def resolve_org_id(
    db: AsyncSession,
    *,
    tenant_id: UUID,
    product: Product,
    tenant_tawala_org_id: Optional[UUID],
    tenant_id_fallback: UUID,
) -> UUID:
    """Prefer product_links.external_org_id, then legacy tenant.tawala_organization_id, else tenant.id."""
    link = (
        await db.exec(
            select(ProductLink).where(
                ProductLink.tenant_id == tenant_id,
                ProductLink.product_id == product.id,
                ProductLink.is_active == True,  # noqa: E712
                ProductLink.deleted_at.is_(None),  # type: ignore[union-attr]
            )
        )
    ).first()
    if link and link.external_org_id:
        return link.external_org_id
    if product.slug == "tawala" and tenant_tawala_org_id:
        return tenant_tawala_org_id
    return tenant_id_fallback


async def upsert_product_link(
    db: AsyncSession,
    *,
    tenant_id: UUID,
    product_slug: str,
    external_org_id: UUID,
) -> ProductLink:
    product = (
        await db.exec(select(Product).where(Product.slug == product_slug.strip().lower()))
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail=f"Unknown product: {product_slug}")

    existing = (
        await db.exec(
            select(ProductLink).where(
                ProductLink.tenant_id == tenant_id,
                ProductLink.product_id == product.id,
            )
        )
    ).first()
    if existing:
        existing.external_org_id = external_org_id
        existing.is_active = True
        existing.deleted_at = None
        db.add(existing)
        await db.commit()
        await db.refresh(existing)
        await invalidate_entitlement_cache(tenant_id, product.slug)
        return existing

    row = ProductLink(
        tenant_id=tenant_id,
        product_id=product.id,
        external_org_id=external_org_id,
        is_active=True,
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    await invalidate_entitlement_cache(tenant_id, product.slug)
    return row
