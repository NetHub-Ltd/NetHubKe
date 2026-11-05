"""Admin: applications, trusted clients."""
from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.api.deps import SessionDep, get_current_admin
from app.core.config import settings
from app.core.rate_limit import limiter
from app.crud import services as svc_crud
from app.crud import trusted_clients as tc_crud
from app.db.models.models import User
from app.db.schemas.schemas import (
    ApplicationMessageCreate,
    ApplicationMessageRead,
    ApplicationRead,
    ApplicationStatusUpdate,
    ServiceRead,
    TrustedClientCreate,
    TrustedClientRead,
)

router = APIRouter(prefix="/admin", tags=["admin"])
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


@router.get("/applications", response_model=list[ApplicationRead])
@limiter.limit(_limit)
async def admin_list_applications(
    request: Request,
    session: SessionDep,
    admin: Annotated[User, Depends(get_current_admin)],
) -> list[ApplicationRead]:
    rows = await svc_crud.list_all_applications(session)
    return [await _to_read(session, r) for r in rows]


@router.get("/applications/{application_id}", response_model=ApplicationRead)
@limiter.limit(_limit)
async def admin_get_application(
    request: Request,
    application_id: uuid.UUID,
    session: SessionDep,
    admin: Annotated[User, Depends(get_current_admin)],
) -> ApplicationRead:
    app = await svc_crud.get_application(session, application_id)
    if app is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return await _to_read(session, app)


@router.post("/applications/{application_id}/messages", response_model=ApplicationMessageRead)
@limiter.limit(_limit)
async def admin_post_message(
    request: Request,
    application_id: uuid.UUID,
    body: ApplicationMessageCreate,
    session: SessionDep,
    admin: Annotated[User, Depends(get_current_admin)],
) -> ApplicationMessageRead:
    app = await svc_crud.get_application(session, application_id)
    if app is None:
        raise HTTPException(status_code=404, detail="Application not found")
    msg = await svc_crud.add_message(
        session,
        application_id=app.id,
        author_user_id=admin.id,
        body=body.body,
        is_from_admin=True,
    )
    return ApplicationMessageRead.model_validate(msg)


@router.patch("/applications/{application_id}", response_model=ApplicationRead)
@limiter.limit(_limit)
async def admin_set_status(
    request: Request,
    application_id: uuid.UUID,
    body: ApplicationStatusUpdate,
    session: SessionDep,
    admin: Annotated[User, Depends(get_current_admin)],
) -> ApplicationRead:
    app = await svc_crud.get_application(session, application_id)
    if app is None:
        raise HTTPException(status_code=404, detail="Application not found")
    app = await svc_crud.set_status(session, app, body.status)
    return await _to_read(session, app)


@router.get("/trusted-clients", response_model=list[TrustedClientRead])
@limiter.limit(_limit)
async def admin_list_clients(
    request: Request,
    session: SessionDep,
    admin: Annotated[User, Depends(get_current_admin)],
) -> list[TrustedClientRead]:
    rows = await tc_crud.list_clients(session)
    return [TrustedClientRead.model_validate(r) for r in rows]


@router.post("/trusted-clients", response_model=TrustedClientRead, status_code=201)
@limiter.limit(_limit)
async def admin_create_client(
    request: Request,
    body: TrustedClientCreate,
    session: SessionDep,
    admin: Annotated[User, Depends(get_current_admin)],
) -> TrustedClientRead:
    row = await tc_crud.create_client(
        session,
        client_id=body.client_id,
        name=body.name,
        product=body.product,
        notes=body.notes,
    )
    return TrustedClientRead.model_validate(row)


@router.post("/trusted-clients/{client_id}/revoke", response_model=TrustedClientRead)
@limiter.limit(_limit)
async def admin_revoke_client(
    request: Request,
    client_id: str,
    session: SessionDep,
    admin: Annotated[User, Depends(get_current_admin)],
) -> TrustedClientRead:
    row = await tc_crud.revoke_client(session, client_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return TrustedClientRead.model_validate(row)
