"""Architecture A identity models — no product-token / signing-key tables."""
from __future__ import annotations

import uuid
from typing import Optional

import sqlalchemy as sa
from sqlmodel import Field, Relationship, SQLModel

from app.db.models.base import BaseMixin


class Tenant(BaseMixin, table=True):
    __tablename__ = "tenants"

    name: str = Field(index=True, max_length=255)
    email: Optional[str] = Field(default=None, max_length=320, index=True)

    users: list["User"] = Relationship(back_populates="tenant")


class User(BaseMixin, table=True):
    __tablename__ = "users"

    email: str = Field(unique=True, index=True, max_length=320)
    username: str = Field(default="", max_length=255, index=True)
    full_name: str = Field(default="", max_length=255)
    is_active: bool = Field(default=True)
    tenant_id: Optional[uuid.UUID] = Field(default=None, foreign_key="tenants.id", index=True)

    tenant: Optional[Tenant] = Relationship(back_populates="users")
    identities: list["UserIdentity"] = Relationship(back_populates="user")


class UserIdentity(BaseMixin, table=True):
    """Canonical upstream identity: (issuer, subject) → local user."""

    __tablename__ = "user_identities"
    __table_args__ = (
        sa.UniqueConstraint("issuer", "subject", name="uq_user_identities_issuer_subject"),
        sa.UniqueConstraint("user_id", "issuer", name="uq_user_identities_user_issuer"),
    )

    issuer: str = Field(max_length=512, index=True)
    subject: str = Field(max_length=512, index=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)

    user: Optional[User] = Relationship(back_populates="identities")
