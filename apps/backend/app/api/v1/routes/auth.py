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
from app.db.models.models import Service, User
from app.services.tawala_token import (
    exchange_enabled,
    build_jwks_document,
    mint_product_access_token,
    get_product_by_slug,
    ensure_tawala_product,
)
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
        description="Force principal owner|terminal; default inferred from roles.",
    )


class TawalaExchangeRequest(BaseModel):
    """Optional body for /exchange/tawala alias."""

    principal: Optional[str] = Field(
        default=None,
        description="Force principal owner|terminal; default inferred from roles/tenant.",
    )


class ExchangeResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_at: int
    org_id: UUID
    principal: str
    audience: str
    product: str


# Backward-compatible alias name
TawalaExchangeResponse = ExchangeResponse


def _infer_principal(token_data: TokenData, user: User) -> str:
    roles = {str(r).lower() for r in (token_data.roles or [])}
    if roles & {"owner", "org_owner", "tenant_owner", "admin", "super_admin"}:
        return "owner"
    return "terminal"


async def _tenant_entitled_to_product(db, tenant_id: UUID, product_slug: str) -> bool:
    """Optional subscription gate. When require flag is off, always allow."""
    if product_slug == "tawala" and not getattr(
        settings, "tawala_exchange_require_subscription", False
    ):
        return True
    if product_slug != "tawala":
        # N4 will enforce product_links / entitlements; N3 allows active products only
        return True
    svc = (
        await db.exec(
            select(Service).where(
                Service.slug == "tawala",
                Service.is_active == True,  # noqa: E712
            )
        )
    ).first()
    if not svc:
        logger.warning("tawala service slug not in catalog; allowing exchange")
        return True
    _ = tenant_id
    return True


@router.get("/jwks.json")
async def product_jwks(db: SessionDep):
    """
    Public JWKS for product resource servers (AUTH_HARD_JWKS_URL).

    Serves active + retiring keys from signing_keys (Redis-cached).
    """
    return await build_jwks_document(db)


async def _run_exchange(
    db,
    token_data: TokenData,
    *,
    product_slug: str,
    principal_override: Optional[str],
) -> ExchangeResponse:
    if not exchange_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Token exchange is not enabled",
        )

    from app.crud.user import user_crud

    # Ensure default tawala row exists in fresh DBs (migration seeds; this is belt-and-suspenders)
    if product_slug.strip().lower() == "tawala":
        await ensure_tawala_product(db)

    product = await get_product_by_slug(db, product_slug)

    user = await user_crud.get_by_sub(db, token_data.sub)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not initialized; call POST /users/sync first",
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

    if not await _tenant_entitled_to_product(db, tenant.id, product.slug):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Tenant is not entitled to {product.slug}",
        )

    # Tawala claim profile: org_id from linked org or tenant id
    if product.claim_profile == "tawala":
        org_id = tenant.tawala_organization_id or tenant.id
    else:
        org_id = tenant.id

    principal = principal_override or _infer_principal(token_data, user)
    principal = str(principal).strip().lower()
    if principal not in ("owner", "terminal"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="principal must be owner or terminal",
        )

    kc_sub = str(user.keycloak_id)
    # Prefer settings audience for tawala so env overrides seed row
    audience = product.audience
    if product.slug == "tawala":
        audience = getattr(settings, "tawala_jwt_audience", None) or product.audience

    access_token, exp = await mint_product_access_token(
        db,
        product_slug=product.slug,
        audience=audience,
        sub=kc_sub,
        org_id=org_id,
        principal=principal,
        email=user.email,
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
    """
    Exchange a valid Keycloak access token for a product access JWT (N3).

    Body: ``{"product": "tawala", "principal": "owner"|"terminal"|null}``
    """
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
    """
    Alias for ``POST /exchange`` with product=tawala (kept for existing clients).
    """
    return await _run_exchange(
        db,
        token_data,
        product_slug="tawala",
        principal_override=body.principal if body else None,
    )
