"""Auth routes: product token exchange (N3) + JWKS."""
from __future__ import annotations

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlmodel import select
from sqlalchemy.orm import selectinload

from app.api.deps import SessionDep, get_token_data
from app.core.config import settings
from app.db.schemas.schemas import TokenData
from app.db.models.models import User
from app.services.tawala_token import (
    exchange_enabled,
    build_jwks_document,
    mint_product_access_token,
    get_product_by_slug,
    ensure_tawala_product,
)
from app.services.entitlements import check_entitled, resolve_org_id
from app.utils.logging import logger

router = APIRouter()


class ExchangeRequest(BaseModel):
    """Generic multi-product exchange body (N3)."""

    product: str = Field(
        ...,
        description="Product slug registered in products table, e.g. tawala",
        min_length=1,
        max_length=64,
    )
    principal: Optional[str] = Field(
        default=None,
        description="Legacy hint; must match the principal derived by NetHubKe.",
    )


class TawalaExchangeRequest(BaseModel):
    """Optional body for /exchange/tawala alias."""

    principal: Optional[str] = Field(
        default=None,
        description="Legacy hint; must match the principal derived by NetHubKe.",
    )


class ExchangeResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_at: int
    org_id: UUID
    principal: str
    audience: str
    product: str


TawalaExchangeResponse = ExchangeResponse


def _infer_principal(token_data: TokenData) -> str:
    """Derive the product principal from verified IdP claims, never client input."""
    roles = {str(role).lower() for role in (token_data.roles or [])}
    if roles & {"owner", "org_owner", "tenant_owner", "admin", "super_admin"}:
        return "owner"
    return "terminal"


def _validate_principal_hint(token_data: TokenData, hint: Optional[str]) -> str:
    """Keep legacy request compatibility without allowing client privilege elevation."""
    inferred = _infer_principal(token_data)
    if hint is None:
        return inferred

    requested = hint.strip().lower()
    if requested not in {"owner", "terminal"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="principal must be owner or terminal",
        )
    if requested != inferred:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="principal is derived by NetHubKe and cannot be overridden",
        )
    return inferred


@router.get("/jwks.json")
async def product_jwks(db: SessionDep):
    """Public JWKS for product resource servers; contains public signing keys only."""
    return await build_jwks_document(db)


async def _run_exchange(
    db,
    token_data: TokenData,
    *,
    product_slug: str,
    principal_override: Optional[str],
) -> ExchangeResponse:
    # Fail closed before any database lookup, key access, or side effect.
    if not exchange_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Token exchange is not enabled",
        )

    principal = _validate_principal_hint(token_data, principal_override)

    from app.crud.user import user_crud

    # Ensure default Tawala row exists in fresh DBs (migration seeds; belt-and-suspenders).
    if product_slug.strip().lower() == "tawala":
        await ensure_tawala_product(db)

    product = await get_product_by_slug(db, product_slug)

    # Resolve only by validated immutable upstream identity. Email is not an identity key.
    user = await user_crud.get_by_upstream_identity(
        db, issuer=token_data.issuer, subject=token_data.sub
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upstream identity is not linked; call POST /users/sync or request explicit account linking",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )
    if not user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not linked to a tenant",
        )

    stmt = (
        select(User)
        .where(User.id == user.id)
        .options(selectinload(User.tenant))
    )
    user = (await db.exec(stmt)).first() or user
    tenant = user.tenant
    if tenant is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tenant not found for user",
        )

    if not await check_entitled(db, tenant_id=tenant.id, product_slug=product.slug):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Tenant is not entitled to {product.slug}",
        )

    org_id = None
    if (product.claim_profile or "").strip().lower() == "tawala":
        org_id = await resolve_org_id(
            db,
            tenant_id=tenant.id,
            product=product,
            tenant_tawala_org_id=tenant.tawala_organization_id,
            tenant_id_fallback=tenant.id,
        )

    nethub_sub = str(user.id)
    audience = product.audience
    if product.slug == "tawala":
        audience = getattr(settings, "tawala_jwt_audience", None) or product.audience
    claim_profile = (product.claim_profile or "").strip().lower()
    if claim_profile not in {"tawala", "standard"}:
        raise HTTPException(status_code=503, detail="Unsupported product claim profile")
    if claim_profile == "standard":
        principal = "user"

    access_token, exp = await mint_product_access_token(
        db,
        product_slug=product.slug,
        audience=audience,
        sub=nethub_sub,
        org_id=org_id,
        principal=principal,
        email=user.email,
        claim_profile=claim_profile,
    )
    logger.info(
        f"Exchange ok product={product.slug} user={user.id} org_id={org_id} principal={principal}"
    )
    return ExchangeResponse(
        access_token=access_token,
        expires_at=exp,
        org_id=org_id,
        principal=principal,
        audience=audience,
        product=product.slug,
    )


@router.post("/exchange", response_model=ExchangeResponse)
async def exchange_product_token(
    db: SessionDep,
    body: ExchangeRequest,
    token_data: TokenData = Depends(get_token_data),
):
    """Exchange a valid upstream IdP access token for a product access JWT."""
    return await _run_exchange(
        db,
        token_data,
        product_slug=body.product,
        principal_override=body.principal,
    )


@router.post("/exchange/tawala", response_model=ExchangeResponse)
async def exchange_tawala_token(
    db: SessionDep,
    token_data: TokenData = Depends(get_token_data),
    body: Optional[TawalaExchangeRequest] = None,
):
    """Backward-compatible alias for POST /exchange with product=tawala."""
    return await _run_exchange(
        db,
        token_data,
        product_slug="tawala",
        principal_override=body.principal if body else None,
    )
