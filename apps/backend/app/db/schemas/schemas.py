"""API / auth schemas."""
from __future__ import annotations

from pydantic import BaseModel, Field


class TokenData(BaseModel):
    """Normalized claims from a validated IdP access token."""

    sub: str = Field(..., description="Opaque subject from IdP (always string)")
    email: str | None = None
    name: str | None = None
    preferred_username: str | None = None
    roles: list[str] = Field(default_factory=list)
    scopes: list[str] = Field(default_factory=list)
    issuer: str | None = None
