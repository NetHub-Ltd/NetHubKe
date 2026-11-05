"""API / auth schemas."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TokenData(BaseModel):
    sub: str = Field(..., description="Opaque subject from IdP")
    email: str | None = None
    name: str | None = None
    preferred_username: str | None = None
    roles: list[str] = Field(default_factory=list)
    scopes: list[str] = Field(default_factory=list)
    issuer: str | None = None
    client_id: str | None = None


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    username: str
    full_name: str
    is_active: bool
    is_admin: bool = False
    tenant_id: uuid.UUID | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class UserUpdate(BaseModel):
    full_name: str | None = None
    username: str | None = None


class TrustedClientRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    client_id: str
    name: str
    product: str
    is_active: bool
    revoked_at: datetime | None = None
    notes: str = ""
    created_at: datetime | None = None


class TrustedClientCreate(BaseModel):
    client_id: str = Field(min_length=1, max_length=128)
    name: str = ""
    product: str = "website"
    notes: str = ""


class ServiceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    title: str
    short_title: str
    summary: str
    accepts_applications: bool
    sort_order: int
    is_active: bool


class ApplicationCreate(BaseModel):
    service_slug: str = Field(min_length=1, max_length=128)
    title: str = Field(default="", max_length=255)
    body: str = Field(min_length=10, max_length=20000)
    budget_band: str = Field(default="", max_length=64)
    timeline: str = Field(default="", max_length=128)
    contact_phone: str = Field(default="", max_length=64)


class ApplicationMessageCreate(BaseModel):
    body: str = Field(min_length=1, max_length=10000)


class ApplicationMessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    application_id: uuid.UUID
    author_user_id: uuid.UUID
    body: str
    is_from_admin: bool
    created_at: datetime | None = None


class ApplicationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    service_id: uuid.UUID
    status: str
    title: str
    body: str
    budget_band: str
    timeline: str
    contact_phone: str
    created_at: datetime | None = None
    updated_at: datetime | None = None
    service: ServiceRead | None = None
    messages: list[ApplicationMessageRead] = Field(default_factory=list)


class ApplicationStatusUpdate(BaseModel):
    status: str = Field(pattern="^(submitted|in_review|quoted|closed)$")
