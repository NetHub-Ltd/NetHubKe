"""Public catalogue reads; admin-scoped mutations."""

from typing import List, Optional, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from loguru import logger
from pydantic import ValidationError
from sqlmodel import select

from app.api.deps import SessionDep, require_scopes
from app.crud.services import service_crud
from app.crud.user import user_crud
from app.db.models.models import Service, Product, ProductLink
from app.db.schemas.schemas import ServiceCreateIn, ServiceRead, TokenData
from app.utils.data.services_data import SERVICES_SEED_DATA

router = APIRouter()


@router.get("/get-services", response_model=List[ServiceRead])
async def read_services(
    db: SessionDep,
    slug: Optional[str] = None,
) -> List[ServiceRead]:
    """Public marketing catalogue — no auth required (see AUTH_MATRIX.md)."""
    if slug:
        logger.debug("fetching service by slug: %s", slug)
        service = await service_crud.get_service_by_slug(slug, db)
        return [service] if service else []

    logger.debug("fetching all services")
    services: List[ServiceRead] = await service_crud.get_multi(db)
    return services


@router.post("/seed-services")
async def seed_services(
    db: SessionDep,
    _user: TokenData = Depends(require_scopes(["services:admin"])),
):
    """Seed catalogue from built-in data — admin only."""
    created = 0
    skipped = 0

    try:
        for raw_service in SERVICES_SEED_DATA:
            input_data = ServiceCreateIn.model_validate(raw_service)
            statement = select(Service).where(Service.slug == input_data.slug)
            result = await db.exec(statement)
            existing_service = result.first()

            if existing_service:
                skipped += 1
                continue

            db_data = input_data.model_dump(mode="json")
            await service_crud.create(db, obj_in=db_data)
            created += 1

        await db.commit()

        return {
            "status": "success",
            "created": created,
            "skipped": skipped,
            "total": len(SERVICES_SEED_DATA),
        }

    except ValidationError as error:
        logger.error("Validation Error: {}", error)
        raise


@router.post("/create-service", response_model=ServiceRead)
async def create_service(
    db: SessionDep,
    service_data: ServiceCreateIn,
    _user: TokenData = Depends(require_scopes(["services:admin"])),
):
    """Create a catalogue service — admin only."""
    return await service_crud.create(db, obj_in=service_data)


class TenantProductStatus(BaseModel):
    """N6: connection status for a product/service from the tenant's perspective."""

    slug: str
    name: str
    status: Literal["connected", "trial", "not_connected"]
    external_org_id: Optional[UUID] = None
    audience: Optional[str] = None


@router.get("/my-status", response_model=List[TenantProductStatus])
async def my_service_status(
    db: SessionDep,
    token_data: TokenData = Depends(require_scopes(["user:read"])),
) -> List[TenantProductStatus]:
    """
    Tenant-scoped product connection status for the dashboard (N6).

    - connected: active product_link exists
    - trial: product active, no link, tenant tier suggests trial (FREE) — soft signal
    - not_connected: product active, no link
    """
    user = await user_crud.get_by_sub(db, token_data.sub)
    if not user:
        raise HTTPException(status_code=404, detail="User profile not initialized")

    products = list(
        await db.exec(
            select(Product).where(
                Product.is_active == True,  # noqa: E712
                Product.deleted_at.is_(None),  # type: ignore[union-attr]
            )
        )
    )
    links_by_product: dict = {}
    if user.tenant_id:
        links = list(
            await db.exec(
                select(ProductLink).where(
                    ProductLink.tenant_id == user.tenant_id,
                    ProductLink.is_active == True,  # noqa: E712
                )
            )
        )
        links_by_product = {link.product_id: link for link in links}

    # Soft trial signal from tenant tier if available
    is_free_tier = False
    if user.tenant_id:
        from app.db.models.models import Tenant

        tenant = (
            await db.exec(select(Tenant).where(Tenant.id == user.tenant_id))
        ).first()
        if tenant is not None:
            tier = getattr(tenant, "tier", None)
            tier_val = getattr(tier, "value", str(tier) if tier is not None else "")
            is_free_tier = str(tier_val).lower() in ("free", "trial", "TenantTier.FREE")

    out: List[TenantProductStatus] = []
    for product in products:
        link = links_by_product.get(product.id)
        if link:
            status: Literal["connected", "trial", "not_connected"] = "connected"
            ext = link.external_org_id
        elif is_free_tier:
            status = "trial"
            ext = None
        else:
            status = "not_connected"
            ext = None
        out.append(
            TenantProductStatus(
                slug=product.slug,
                name=product.name,
                status=status,
                external_org_id=ext,
                audience=product.audience,
            )
        )

    # If no products registered yet, surface catalogue services as not_connected
    if not out:
        catalogue = await service_crud.get_multi(db)
        for svc in catalogue:
            out.append(
                TenantProductStatus(
                    slug=svc.slug,
                    name=svc.title,
                    status="trial" if is_free_tier else "not_connected",
                    external_org_id=None,
                    audience=None,
                )
            )
    return out
