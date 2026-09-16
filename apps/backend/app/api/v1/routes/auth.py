"""Auth routes: Tawala hard-session token exchange (M2)."""
from __future__ import annotations

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlmodel import select
from sqlalchemy.orm import selectinload

from app.api.deps import SessionDep, get_token_data
from app.core.config import settings
from app.core.security import TokenData
from app.db.models.models import Service, Subscription, User
from app.services.tawala_token import exchange_enabled, build_jwks_document, mint_tawala_access_token
from app.utils.logging import logger

router = APIRouter()


class TawalaExchangeRequest(BaseModel):
    """Optional body; Keycloak access token is taken from Authorization header."""

    principal: Optional[str] = Field(
        default=None,
        description="Force principal owner|terminal; default inferred from roles/tenant.",
    )


class TawalaExchangeResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_at: int
    org_id: UUID
    principal: str
    audience: str


def _infer_principal(token_data: TokenData, user: User) -> str:
    roles = {str(r).lower() for r in (token_data.roles or [])}
    if roles & {"owner", "org_owner", "tenant_owner", "admin", "super_admin"}:
        return "owner"
    # Default shared-terminal session after org login
    return "terminal"


async def _tenant_entitled_to_tawala(db, tenant_id: UUID) -> bool:
    """Subscription gate (optional). When require flag is off, always allow."""
    if not getattr(settings, "tawala_exchange_require_subscription", False):
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
    # Future: join tenant subscriptions / plans. For M2, flag-on without catalog still allows.
    _ = tenant_id
    return True


@router.get("/jwks.json")
async def tawala_jwks(db: SessionDep):
    """
    Public JWKS for Tawala AUTH_HARD_JWKS_URL.

    Serves active + retiring keys from signing_keys (Redis-cached).
    Safe to expose; contains only public key material.
    """
    return await build_jwks_document(db)


@router.post("/exchange/tawala", response_model=TawalaExchangeResponse)
async def exchange_tawala_token(
    db: SessionDep,
    token_data: TokenData = Depends(get_token_data),
    body: Optional[TawalaExchangeRequest] = None,
):
    """
    Exchange a valid Keycloak access token for a Tawala hard-session JWT.

    - Does **not** create cashier rows in NetHub
    - Requires local User synced (POST /users/sync) and linked tenant
    - org_id claim uses tenant.tawala_organization_id when set, else tenant.id
    """
    if not exchange_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Tawala token exchange is not enabled",
        )

    # token_data.sub may already be remapped in get_current_user; get_token_data keeps Keycloak sub
    from app.crud.user import user_crud

    # Prefer Keycloak sub lookup — TokenData.sub from get_token_data is Keycloak sub
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

    if not await _tenant_entitled_to_tawala(db, tenant.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tenant is not entitled to Tawala",
        )

    org_id = tenant.tawala_organization_id or tenant.id
    principal = (body.principal if body and body.principal else None) or _infer_principal(
        token_data, user
    )
    principal = str(principal).strip().lower()
    if principal not in ("owner", "terminal"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="principal must be owner or terminal",
        )

    # Keycloak subject for Tawala sub claim (stable IdP id)
    kc_sub = str(user.keycloak_id)

    access_token, exp = await mint_tawala_access_token(
        db,
        sub=kc_sub,
        org_id=org_id,
        principal=principal,
        email=user.email,
    )
    logger.info(
        f"Tawala exchange ok user={user.id} org_id={org_id} principal={principal}"
    )
    return TawalaExchangeResponse(
        access_token=access_token,
        expires_at=exp,
        org_id=org_id,
        principal=principal,
        audience=settings.tawala_jwt_audience,
    )
