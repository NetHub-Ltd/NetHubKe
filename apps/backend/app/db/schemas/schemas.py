"""API / auth schemas."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TokenData(BaseModel):
    """Normalized claims from a validated IdP access token."""

    sub: str = Field(..., description="Opaque subject from IdP (always string)")
    email: str | None = None
    name: str | None = None
    preferred_username: str | None = None
    roles: list[str] = Field(default_factory=list)
    scopes: list[str] = Field(default_factory=list)
    issuer: str | None = None


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    username: str
    full_name: str
    is_active: bool
    tenant_id: uuid.UUID | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class UserUpdate(BaseModel):
    full_name: str | None = None
    username: str | None = None
