"""Service catalog + applications."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db.models.models import ApplicationMessage, Service, ServiceApplication
from app.db.schemas.schemas import ApplicationCreate

DEFAULT_SERVICES = [
    {
        "slug": "website-development-kenya",
        "title": "Website design & web development",
        "short_title": "Websites",
        "summary": "Clear, useful websites that help customers find and contact you.",
        "sort_order": 10,
    },
    {
        "slug": "mobile-app-development",
        "title": "Mobile application development",
        "short_title": "Mobile apps",
        "summary": "Practical mobile experiences shaped around a real business need.",
        "sort_order": 20,
    },
    {
        "slug": "seo-conversion-kenya",
        "title": "SEO & conversion improvement",
        "short_title": "SEO & conversion",
        "summary": "Get found by the right people and turn more visits into enquiries.",
        "sort_order": 30,
    },
    {
        "slug": "business-technology-solutions",
        "title": "Business technology & systems",
        "short_title": "Business systems",
        "summary": "Tools and workflows that reduce friction in day-to-day operations.",
        "sort_order": 40,
    },
]


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


async def seed_services(session: AsyncSession) -> None:
    result = await session.exec(select(Service))
    if result.first():
        return
    for item in DEFAULT_SERVICES:
        session.add(Service(**item, accepts_applications=True, is_active=True))
    await session.commit()


async def list_active_services(session: AsyncSession) -> list[Service]:
    await seed_services(session)
    result = await session.exec(
        select(Service)
        .where(Service.is_active == True, Service.accepts_applications == True)  # noqa: E712
        .order_by(Service.sort_order)
    )
    return list(result.all())


async def get_service_by_slug(session: AsyncSession, slug: str) -> Service | None:
    await seed_services(session)
    result = await session.exec(select(Service).where(Service.slug == slug))
    return result.first()


async def create_application(
    session: AsyncSession, *, user_id: uuid.UUID, data: ApplicationCreate
) -> ServiceApplication:
    service = await get_service_by_slug(session, data.service_slug)
    if service is None or not service.accepts_applications or not service.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    app = ServiceApplication(
        user_id=user_id,
        service_id=service.id,
        status="submitted",
        title=data.title or service.short_title or service.title,
        body=data.body,
        budget_band=data.budget_band,
        timeline=data.timeline,
        contact_phone=data.contact_phone,
    )
    session.add(app)
    await session.commit()
    await session.refresh(app)
    return app


async def list_user_applications(session: AsyncSession, user_id: uuid.UUID) -> list[ServiceApplication]:
    result = await session.exec(
        select(ServiceApplication)
        .where(ServiceApplication.user_id == user_id)
        .order_by(ServiceApplication.created_at.desc())
    )
    return list(result.all())


async def list_all_applications(session: AsyncSession) -> list[ServiceApplication]:
    result = await session.exec(
        select(ServiceApplication).order_by(ServiceApplication.created_at.desc())
    )
    return list(result.all())


async def get_application(session: AsyncSession, app_id: uuid.UUID) -> ServiceApplication | None:
    result = await session.exec(select(ServiceApplication).where(ServiceApplication.id == app_id))
    return result.first()


async def add_message(
    session: AsyncSession,
    *,
    application_id: uuid.UUID,
    author_user_id: uuid.UUID,
    body: str,
    is_from_admin: bool,
) -> ApplicationMessage:
    msg = ApplicationMessage(
        application_id=application_id,
        author_user_id=author_user_id,
        body=body,
        is_from_admin=is_from_admin,
    )
    session.add(msg)
    app = await get_application(session, application_id)
    if app and is_from_admin and app.status == "submitted":
        app.status = "in_review"
        app.updated_at = _utcnow()
        session.add(app)
    await session.commit()
    await session.refresh(msg)
    return msg


async def list_messages(session: AsyncSession, application_id: uuid.UUID) -> list[ApplicationMessage]:
    result = await session.exec(
        select(ApplicationMessage)
        .where(ApplicationMessage.application_id == application_id)
        .order_by(ApplicationMessage.created_at.asc())
    )
    return list(result.all())


async def set_status(
    session: AsyncSession, app: ServiceApplication, status_value: str
) -> ServiceApplication:
    app.status = status_value
    app.updated_at = _utcnow()
    session.add(app)
    await session.commit()
    await session.refresh(app)
    return app
