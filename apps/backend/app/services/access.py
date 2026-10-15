"""Path A: resolve product access principal for GET /access/{product_slug}.

Service-agnostic: any registered product slug uses the same membership +
entitlement + ProductLink resolution. Products adapt to the response shape.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import selectinload
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.crud.user import user_crud
from app.db.models.models import Membership, Product, Tenant, User
from app.db.schemas.schemas import TokenData
from app.services.entitlements import check_entitled, resolve_org_id
from app.utils.logging import logger


@dataclass(frozen=True)
class ProductAccessPrincipal:
    user_id: UUID
    sub: str
    email: str
    tenant_id: UUID
    product: str
    entitled: bool
    role: str
    external_org_id: Optional[UUID]
    external_user_id: Optional[UUID]


async def resolve_product_access(
    db: AsyncSession,
    *,
    token_data: TokenData,
    product_slug: str,
) -> ProductAccessPrincipal:
    """
    Validate local user + active membership + entitlement for product.

    Caller must already have validated the IdP JWT (token_data from get_token_data
    or get_current_user). This function does not decode tokens.
    """
    slug = (product_slug or "").strip().lower()
    if not slug:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown product")

    if not token_data.email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing email claim",
        )

    user = await user_crud.get_by_email(db, str(token_data.email))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not initialized; call POST /users/sync first",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled. Please contact NetHub support.",
        )
    if not user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User has no tenant",
        )

    product = (
        await db.exec(
            select(Product).where(
                Product.slug == slug,
                Product.is_active == True,  # noqa: E712
                Product.deleted_at.is_(None),  # type: ignore[union-attr]
            )
        )
    ).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown product")

    membership = (
        await db.exec(
            select(Membership).where(
                Membership.user_id == user.id,
                Membership.tenant_id == user.tenant_id,
                Membership.product_id == product.id,
                Membership.is_active == True,  # noqa: E712
                Membership.deleted_at.is_(None),  # type: ignore[union-attr]
            )
        )
    ).first()
    if not membership:
        logger.info(
            f"access denied: no membership user={user.id} product={slug} tenant={user.tenant_id}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No active membership for this product",
        )

    entitled = await check_entitled(db, tenant_id=user.tenant_id, product_slug=slug)
    if not entitled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tenant is not entitled to this product",
        )

    tenant = (
        await db.exec(select(Tenant).where(Tenant.id == user.tenant_id))
    ).first()
    tenant_tawala_org = getattr(tenant, "tawala_organization_id", None) if tenant else None

    external_org_id = await resolve_org_id(
        db,
        tenant_id=user.tenant_id,
        product=product,
        tenant_tawala_org_id=tenant_tawala_org,
        tenant_id_fallback=user.tenant_id,
    )

    # Platform product may not need external_org_id; still return resolved value
    return ProductAccessPrincipal(
        user_id=user.id,
        sub=str(token_data.sub or ""),
        email=str(user.email),
        tenant_id=user.tenant_id,
        product=slug,
        entitled=True,
        role=str(membership.role),
        external_org_id=external_org_id,
        external_user_id=membership.external_user_id,
    )
