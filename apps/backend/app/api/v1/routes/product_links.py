"""Tenant product links (N4) — map external product org IDs."""
from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlmodel import select

from app.api.deps import SessionDep, get_token_data, require_scopes
from app.crud.user import user_crud
from app.db.models.models import Product, ProductLink
from app.db.schemas.schemas import TokenData
from app.services.entitlements import upsert_product_link
from app.utils.logging import logger

router = APIRouter()


class ProductLinkBody(BaseModel):
    product: str = Field(..., min_length=1, max_length=64, description="Product slug, e.g. tawala")
    external_org_id: UUID = Field(..., description="External product organization UUID")


class ProductLinkRead(BaseModel):
    product: str
    external_org_id: UUID
    is_active: bool


def _is_owner(token: TokenData) -> bool:
    roles = {str(r).lower() for r in (token.roles or [])}
    return bool(roles & {"owner", "org_owner", "tenant_owner", "admin", "super_admin"})


@router.put("/me/product-links", response_model=ProductLinkRead)
async def set_my_product_link(
    body: ProductLinkBody,
    db: SessionDep,
    token_data: TokenData = Depends(require_scopes(["user:write"], all_required=True)),
):
    """
    Owner/admin: link current tenant to an external product org_id (e.g. Tawala organization UUID).

    Used as org_id claim on token exchange when present.
    """
    if not _is_owner(token_data):
        # Also allow user:write holders who are linked; still require elevated role for org mapping
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owner or admin roles may set product organization links",
        )

    user = await user_crud.get_by_sub(db, token_data.sub)
    if not user or not user.tenant_id:
        raise HTTPException(status_code=404, detail="User or tenant not found")

    link = await upsert_product_link(
        db,
        tenant_id=user.tenant_id,
        product_slug=body.product,
        external_org_id=body.external_org_id,
    )
    product = (await db.exec(select(Product).where(Product.id == link.product_id))).first()
    logger.info(
        f"product_link set tenant={user.tenant_id} product={body.product} org={body.external_org_id}"
    )
    return ProductLinkRead(
        product=product.slug if product else body.product,
        external_org_id=link.external_org_id,
        is_active=link.is_active,
    )


@router.get("/me/product-links", response_model=list[ProductLinkRead])
async def list_my_product_links(
    db: SessionDep,
    token_data: TokenData = Depends(require_scopes(["user:read"])),
):
    user = await user_crud.get_by_sub(db, token_data.sub)
    if not user or not user.tenant_id:
        return []
    rows = (
        await db.exec(
            select(ProductLink, Product)
            .join(Product, Product.id == ProductLink.product_id)
            .where(
                ProductLink.tenant_id == user.tenant_id,
                ProductLink.is_active == True,  # noqa: E712
            )
        )
    ).all()
    out: list[ProductLinkRead] = []
    for link, product in rows:
        out.append(
            ProductLinkRead(
                product=product.slug,
                external_org_id=link.external_org_id,
                is_active=link.is_active,
            )
        )
    return out
