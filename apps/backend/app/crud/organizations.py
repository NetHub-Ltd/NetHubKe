"""Organization and membership CRUD."""
from __future__ import annotations

import re
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db.models.models import Organization, OrganizationMembership, User

_SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
ACTIVE = "active"
REMOVED = "removed"
ROLES_MANAGE = frozenset({"owner", "admin"})


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def slugify(name: str) -> str:
    s = name.strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s[:128] or "org"


async def get_organization(session: AsyncSession, org_id: uuid.UUID) -> Organization | None:
    result = await session.exec(select(Organization).where(Organization.id == org_id))
    return result.first()


async def get_membership(
    session: AsyncSession, *, org_id: uuid.UUID, user_id: uuid.UUID
) -> OrganizationMembership | None:
    result = await session.exec(
        select(OrganizationMembership).where(
            OrganizationMembership.organization_id == org_id,
            OrganizationMembership.user_id == user_id,
        )
    )
    return result.first()


async def require_active_membership(
    session: AsyncSession,
    *,
    org_id: uuid.UUID,
    user_id: uuid.UUID,
    roles: frozenset[str] | None = None,
) -> OrganizationMembership:
    """Raise 404 if not an active member (no existence leak across orgs)."""
    org = await get_organization(session, org_id)
    if org is None or org.status == "closed":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    m = await get_membership(session, org_id=org_id, user_id=user_id)
    if m is None or m.status != ACTIVE:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    if roles is not None and m.role not in roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient organization role")
    return m


async def create_organization(
    session: AsyncSession,
    *,
    name: str,
    slug: str | None,
    owner: User,
) -> Organization:
    resolved = (slug or slugify(name)).lower()
    if not _SLUG_RE.match(resolved):
        raise HTTPException(status_code=400, detail="Invalid organization slug")
    existing = await session.exec(select(Organization).where(Organization.slug == resolved))
    if existing.first():
        raise HTTPException(status_code=409, detail="Organization slug already exists")
    org = Organization(name=name.strip()[:255], slug=resolved, status=ACTIVE)
    session.add(org)
    await session.flush()
    membership = OrganizationMembership(
        organization_id=org.id,
        user_id=owner.id,
        role="owner",
        status=ACTIVE,
        invited_by_user_id=owner.id,
    )
    session.add(membership)
    await session.commit()
    await session.refresh(org)
    return org


async def list_user_organizations(
    session: AsyncSession, user_id: uuid.UUID
) -> list[tuple[Organization, OrganizationMembership]]:
    result = await session.exec(
        select(Organization, OrganizationMembership)
        .join(
            OrganizationMembership,
            OrganizationMembership.organization_id == Organization.id,
        )
        .where(
            OrganizationMembership.user_id == user_id,
            OrganizationMembership.status == ACTIVE,
            Organization.status != "closed",
        )
        .order_by(Organization.name)
    )
    return list(result.all())


async def list_members(
    session: AsyncSession, org_id: uuid.UUID
) -> list[OrganizationMembership]:
    result = await session.exec(
        select(OrganizationMembership)
        .where(
            OrganizationMembership.organization_id == org_id,
            OrganizationMembership.status == ACTIVE,
        )
        .order_by(OrganizationMembership.created_at)
    )
    return list(result.all())


async def add_member(
    session: AsyncSession,
    *,
    org: Organization,
    user: User,
    role: str,
    invited_by: User,
) -> OrganizationMembership:
    if role not in {"owner", "admin", "member"}:
        raise HTTPException(status_code=400, detail="Invalid role")
    existing = await get_membership(session, org_id=org.id, user_id=user.id)
    if existing and existing.status == ACTIVE:
        raise HTTPException(status_code=409, detail="User is already a member")
    if existing:
        existing.status = ACTIVE
        existing.role = role
        existing.invited_by_user_id = invited_by.id
        existing.updated_at = _utcnow()
        session.add(existing)
        await session.commit()
        await session.refresh(existing)
        return existing
    row = OrganizationMembership(
        organization_id=org.id,
        user_id=user.id,
        role=role,
        status=ACTIVE,
        invited_by_user_id=invited_by.id,
    )
    session.add(row)
    await session.commit()
    await session.refresh(row)
    return row


async def remove_member(
    session: AsyncSession,
    *,
    org: Organization,
    target_user_id: uuid.UUID,
) -> OrganizationMembership:
    m = await get_membership(session, org_id=org.id, user_id=target_user_id)
    if m is None or m.status != ACTIVE:
        raise HTTPException(status_code=404, detail="Membership not found")
    if m.role == "owner":
        owners = await session.exec(
            select(OrganizationMembership).where(
                OrganizationMembership.organization_id == org.id,
                OrganizationMembership.role == "owner",
                OrganizationMembership.status == ACTIVE,
            )
        )
        if len(list(owners.all())) <= 1:
            raise HTTPException(
                status_code=400, detail="Cannot remove the last organization owner"
            )
    m.status = REMOVED
    m.updated_at = _utcnow()
    session.add(m)
    await session.commit()
    await session.refresh(m)
    return m
