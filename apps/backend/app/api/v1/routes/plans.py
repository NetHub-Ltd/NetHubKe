"""Public plan catalog."""
from __future__ import annotations

from fastapi import APIRouter, Query

from app.api.deps import SessionDep
from app.crud import subscriptions as sub_crud
from app.db.schemas.schemas import PlanRead

router = APIRouter(prefix="/plans", tags=["plans"])


@router.get("", response_model=list[PlanRead])
async def list_plans(
    session: SessionDep,
    product: str | None = Query(default=None),
) -> list[PlanRead]:
    await sub_crud.seed_default_plans(session)
    rows = await sub_crud.list_active_plans(session, product=product)
    return [PlanRead.model_validate(r) for r in rows]
