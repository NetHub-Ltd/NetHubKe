"""Organization and membership APIs."""
from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.api.deps import SessionDep, get_current_user
from app.core.config import settings
from app.core.rate_limit import limiter
from app.crud import audit as audit_crud
from app.crud import organizations as org_crud
from app.crud import user as user_crud
from app.db.models.models import User
from app.db.schemas.schemas import (
    MembershipCreate,
    OrganizationCreate,
    OrganizationMembershipRead,
    OrganizationRead,
    OrganizationWithMembershipRead,
)

router = APIRouter(prefix="/organizations", tags=["organizations"])
_limit = settings.rate_limit_user_routes


@router.post("", response_model=OrganizationWithMembershipRead, status_code=status.HTTP_201_CREATED)
@limiter.limit(_limit)
async def create_organization(
    request: Request,
    body: OrganizationCreate,
    session: SessionDep,
    user: Annotated[User, Depends(get_current_user)],
) -> OrganizationWithMembershipRead:
    org = await org_crud.create_organization(
        session, name=body.name, slug=body.slug, owner=user
    )
    membership = await org_crud.get_membership(session, org_id=org.id, user_id=user.id)
    await audit_crud.record_event(
        session,
        action="organization.create",
        actor_user_id=user.id,
        target_type="organization",
        target_id=str(org.id),
        organization_id=org.id,
        detail={"slug": org.slug, "name": org.name},
        commit=True,
    )
    assert membership is not None
    return OrganizationWithMembershipRead(
        organization=OrganizationRead.model_validate(org),
        membership=OrganizationMembershipRead.model_validate(membership),
    )


@router.get("", response_model=list[OrganizationWithMembershipRead])
@limiter.limit(_limit)
async def list_my_organizations(
    request: Request,
    session: SessionDep,
    user: Annotated[User, Depends(get_current_user)],
) -> list[OrganizationWithMembershipRead]:
    rows = await org_crud.list_user_organizations(session, user.id)
    return [
        OrganizationWithMembershipRead(
            organization=OrganizationRead.model_validate(org),
            membership=OrganizationMembershipRead.model_validate(m),
        )
        for org, m in rows
    ]


@router.get("/{organization_id}", response_model=OrganizationRead)
@limiter.limit(_limit)
async def get_organization(
    request: Request,
    organization_id: uuid.UUID,
    session: SessionDep,
    user: Annotated[User, Depends(get_current_user)],
) -> OrganizationRead:
    await org_crud.require_active_membership(
        session, org_id=organization_id, user_id=user.id
    )
    org = await org_crud.get_organization(session, organization_id)
    assert org is not None
    return OrganizationRead.model_validate(org)


@router.get("/{organization_id}/members", response_model=list[OrganizationMembershipRead])
@limiter.limit(_limit)
async def list_members(
    request: Request,
    organization_id: uuid.UUID,
    session: SessionDep,
    user: Annotated[User, Depends(get_current_user)],
) -> list[OrganizationMembershipRead]:
    await org_crud.require_active_membership(
        session, org_id=organization_id, user_id=user.id
    )
    rows = await org_crud.list_members(session, organization_id)
    return [OrganizationMembershipRead.model_validate(r) for r in rows]


@router.post(
    "/{organization_id}/members",
    response_model=OrganizationMembershipRead,
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit(_limit)
async def add_member(
    request: Request,
    organization_id: uuid.UUID,
    body: MembershipCreate,
    session: SessionDep,
    user: Annotated[User, Depends(get_current_user)],
) -> OrganizationMembershipRead:
    await org_crud.require_active_membership(
        session,
        org_id=organization_id,
        user_id=user.id,
        roles=org_crud.ROLES_MANAGE,
    )
    org = await org_crud.get_organization(session, organization_id)
    assert org is not None
    target = await user_crud.get_user_by_id(session, body.user_id)
    if target is None or not target.is_active:
        raise HTTPException(status_code=404, detail="User not found")
    membership = await org_crud.add_member(
        session, org=org, user=target, role=body.role, invited_by=user
    )
    await audit_crud.record_event(
        session,
        action="organization.member.add",
        actor_user_id=user.id,
        target_type="user",
        target_id=str(target.id),
        organization_id=org.id,
        detail={"role": body.role},
        commit=True,
    )
    return OrganizationMembershipRead.model_validate(membership)


@router.delete(
    "/{organization_id}/members/{member_user_id}",
    response_model=OrganizationMembershipRead,
)
@limiter.limit(_limit)
async def remove_member(
    request: Request,
    organization_id: uuid.UUID,
    member_user_id: uuid.UUID,
    session: SessionDep,
    user: Annotated[User, Depends(get_current_user)],
) -> OrganizationMembershipRead:
    await org_crud.require_active_membership(
        session,
        org_id=organization_id,
        user_id=user.id,
        roles=org_crud.ROLES_MANAGE,
    )
    org = await org_crud.get_organization(session, organization_id)
    assert org is not None
    membership = await org_crud.remove_member(
        session, org=org, target_user_id=member_user_id
    )
    await audit_crud.record_event(
        session,
        action="organization.member.remove",
        actor_user_id=user.id,
        target_type="user",
        target_id=str(member_user_id),
        organization_id=org.id,
        commit=True,
    )
    return OrganizationMembershipRead.model_validate(membership)
