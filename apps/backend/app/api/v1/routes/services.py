"""Public catalogue reads; admin-scoped mutations."""

from typing import List, Optional

from fastapi import APIRouter, Depends
from loguru import logger
from pydantic import ValidationError
from sqlmodel import select

from app.api.deps import SessionDep, require_scopes
from app.crud.services import service_crud
from app.db.models.models import Service
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
