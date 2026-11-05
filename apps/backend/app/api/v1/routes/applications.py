"""User service applications (quotes / proposals)."""
from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.api.deps import SessionDep, get_current_user, get_token_data
from app.core.config import settings
from app.core.rate_limit import limiter
from app.crud import services as svc_crud
from app.crud import user as user_crud
from app.db.models.models import User
from app.db.schemas.schemas import (
    ApplicationCreate,
    ApplicationMessageCreate,
    ApplicationMessageRead,
    ApplicationRead,
    ServiceRead,
    TokenData,
)

router = APIRouter(prefix="/applications", tags=["applications"])
_limit = settings.rate_limit_user_routes


async def _to_read(session, app) -> ApplicationRead:
    from sqlmodel import select
    from app.db.models.models import Service

    service = None
    res = await session.exec(select(Service).where(Service.id == app.service_id))
    svc = res.first()
    if svc:
        service = ServiceRead.model_validate(svc)
    messages = await svc_crud.list_messages(session, app.id)
    return ApplicationRead(
        id=app.id,
        user_id=app.user_id,
        service_id=app.service_id,
        status=app.status,
        title=app.title,
        body=app.body,
        budget_band=app.budget_band,
        timeline=app.timeline,
        contact_phone=app.contact_phone,
        created_at=app.created_at,
        updated_at=app.updated_at,
        service=service,
        messages=[ApplicationMessageRead.model_validate(m) for m in messages],
    )


@router.post("", response_model=ApplicationRead, status_code=status.HTTP_201_CREATED)
@limiter.limit(_limit)
async def create_application(
    request: Request,
    body: ApplicationCreate,
    session: SessionDep,
    token: Annotated[TokenData, Depends(get_token_data)],
) -> ApplicationRead:
    user = await user_crud.sync_user_from_token(session, token)
    app = await svc_crud.create_application(session, user_id=user.id, data=body)
    return await _to_read(session, app)


@router.get("", response_model=list[ApplicationRead])
@limiter.limit(_limit)
async def my_applications(
    request: Request,
    session: SessionDep,
    user: Annotated[User, Depends(get_current_user)],
) -> list[ApplicationRead]:
    rows = await svc_crud.list_user_applications(session, user.id)
    return [await _to_read(session, r) for r in rows]


@router.get("/{application_id}", response_model=ApplicationRead)
@limiter.limit(_limit)
async def get_application(
    request: Request,
    application_id: uuid.UUID,
    session: SessionDep,
    user: Annotated[User, Depends(get_current_user)],
) -> ApplicationRead:
    app = await svc_crud.get_application(session, application_id)
    if app is None or app.user_id != user.id:
        raise HTTPException(status_code=404, detail="Application not found")
    return await _to_read(session, app)


@router.post("/{application_id}/messages", response_model=ApplicationMessageRead)
@limiter.limit(_limit)
async def post_message(
    request: Request,
    application_id: uuid.UUID,
    body: ApplicationMessageCreate,
    session: SessionDep,
    user: Annotated[User, Depends(get_current_user)],
) -> ApplicationMessageRead:
    app = await svc_crud.get_application(session, application_id)
    if app is None or app.user_id != user.id:
        raise HTTPException(status_code=404, detail="Application not found")
    msg = await svc_crud.add_message(
        session,
        application_id=app.id,
        author_user_id=user.id,
        body=body.body,
        is_from_admin=False,
    )
    return ApplicationMessageRead.model_validate(msg)
