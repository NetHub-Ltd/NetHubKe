"""Domain models — identity, trusted clients, services, applications."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

import sqlalchemy as sa
from sqlalchemy import Column, Text
from sqlmodel import Field

from app.db.models.base import BaseMixin


class Tenant(BaseMixin, table=True):
    __tablename__ = "tenants"

    name: str = Field(index=True, max_length=255)
    email: Optional[str] = Field(default=None, max_length=320, index=True)


class User(BaseMixin, table=True):
    __tablename__ = "users"

    email: str = Field(unique=True, index=True, max_length=320)
    username: str = Field(default="", max_length=255, index=True)
    full_name: str = Field(default="", max_length=255)
    is_active: bool = Field(default=True)
    is_admin: bool = Field(default=False, index=True)
    tenant_id: Optional[uuid.UUID] = Field(default=None, foreign_key="tenants.id", index=True)


class UserIdentity(BaseMixin, table=True):
    __tablename__ = "user_identities"
    __table_args__ = (
        sa.UniqueConstraint("issuer", "subject", name="uq_user_identities_issuer_subject"),
        sa.UniqueConstraint("user_id", "issuer", name="uq_user_identities_user_issuer"),
    )

    issuer: str = Field(max_length=512, index=True)
    subject: str = Field(max_length=512, index=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)


class TrustedClient(BaseMixin, table=True):
    """OIDC client_id / audience values allowed to call the resource server."""

    __tablename__ = "trusted_clients"

    client_id: str = Field(unique=True, index=True, max_length=128)
    name: str = Field(default="", max_length=255)
    product: str = Field(default="website", max_length=64, index=True)
    is_active: bool = Field(default=True, index=True)
    revoked_at: Optional[datetime] = Field(
        default=None, sa_type=sa.DateTime(timezone=True)
    )
    notes: str = Field(default="", max_length=512)


class Service(BaseMixin, table=True):
    """Catalog entry users can request a quote for (not Tawala/NetPay products)."""

    __tablename__ = "services"

    slug: str = Field(unique=True, index=True, max_length=128)
    title: str = Field(max_length=255)
    short_title: str = Field(default="", max_length=128)
    summary: str = Field(default="", max_length=512)
    accepts_applications: bool = Field(default=True, index=True)
    sort_order: int = Field(default=0, index=True)
    is_active: bool = Field(default=True, index=True)


class ServiceApplication(BaseMixin, table=True):
    __tablename__ = "service_applications"
    __table_args__ = (
        sa.Index("ix_service_applications_user_status", "user_id", "status"),
    )

    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    service_id: uuid.UUID = Field(foreign_key="services.id", index=True)
    status: str = Field(default="submitted", max_length=32, index=True)
    # draft | submitted | in_review | quoted | closed
    title: str = Field(default="", max_length=255)
    body: str = Field(default="", sa_column=Column(Text, nullable=False, server_default=""))
    budget_band: str = Field(default="", max_length=64)
    timeline: str = Field(default="", max_length=128)
    contact_phone: str = Field(default="", max_length=64)


class ApplicationMessage(BaseMixin, table=True):
    __tablename__ = "application_messages"

    application_id: uuid.UUID = Field(foreign_key="service_applications.id", index=True)
    author_user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    body: str = Field(sa_column=Column(Text, nullable=False))
    is_from_admin: bool = Field(default=False, index=True)
