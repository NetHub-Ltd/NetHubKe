"""Public service catalog."""
from __future__ import annotations

from fastapi import APIRouter

from app.api.deps import SessionDep
from app.crud import services as svc_crud
from app.db.schemas.schemas import ServiceRead

router = APIRouter(prefix="/services", tags=["services"])


@router.get("", response_model=list[ServiceRead])
async def list_services(session: SessionDep) -> list[ServiceRead]:
    rows = await svc_crud.list_active_services(session)
    return [ServiceRead.model_validate(r) for r in rows]
