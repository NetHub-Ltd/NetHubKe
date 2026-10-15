"""Path A: GET /access/{product_slug} — IdP Bearer → product principal JSON."""
from __future__ import annotations

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr, Field

from app.api.deps import SessionDep, get_token_data
from app.db.schemas.schemas import TokenData
from app.services.access import resolve_product_access

router = APIRouter()


class ProductAccessResponse(BaseModel):
    """Generic access principal — products adapt to this shape."""

    user_id: UUID
    sub: str = ""
    email: EmailStr
    tenant_id: UUID
    product: str
    entitled: bool = True
    role: str
    external_org_id: Optional[UUID] = None
    external_user_id: Optional[UUID] = Field(
        default=None,
        description="Product domain user PK (e.g. PlatformUser.id or Staff.id)",
    )


@router.get("/{product_slug}", response_model=ProductAccessResponse)
async def get_product_access(
    product_slug: str,
    db: SessionDep,
    token_data: TokenData = Depends(get_token_data),
):
    """
    Resolve whether the IdP principal may use ``product_slug``.

    Does not mint product JWTs. Callers (e.g. Tawala session establish) forward
    the IdP access token and receive JSON for an opaque session.
    """
    principal = await resolve_product_access(
        db, token_data=token_data, product_slug=product_slug
    )
    return ProductAccessResponse(
        user_id=principal.user_id,
        sub=principal.sub,
        email=principal.email,
        tenant_id=principal.tenant_id,
        product=principal.product,
        entitled=principal.entitled,
        role=principal.role,
        external_org_id=principal.external_org_id,
        external_user_id=principal.external_user_id,
    )
