import uuid
from datetime import datetime
from typing import List, Optional, Any

from pydantic import ConfigDict, model_validator
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, Column, JSON, Relationship
from sqlalchemy import Text, DateTime as SADateTime
import sqlalchemy as sa

from app.db.models.base import BaseMixin
from app.db.schemas.enums import ServiceIcon, ServicePricing, ServiceFAQ, TenantTier


class Tenant(BaseMixin, table=True):
    __tablename__ = "tenants"
    name: str = Field(index=True)
    email: str = Field(unique=True, index=True)
    tier: TenantTier = Field(
        default=TenantTier.FREE,
        index=True,
        description="The subscription tier governing resource limits."
    )
    # Link to TawalaKE organizations.id for hard-session org_id claim (nullable until linked).
    tawala_organization_id: Optional[uuid.UUID] = Field(
        default=None,
        index=True,
        description="Tawala Organization UUID used as org_id in exchanged tokens.",
    )
    # Relationship: One Tenant has Many Users
    users: List["User"] = Relationship(back_populates="tenant")


class User(BaseMixin, table=True):
    __tablename__ = "users"

    username: str = Field(index=True)
    email: str = Field(index=True)
    full_name: str = Field(alias="fullName")
    is_active: bool = Field(default=False)

    # Binary UUID for high-speed lookups
    keycloak_id: uuid.UUID = Field(unique=True, index=True)

    # Foreign Key: Remove unique=True so many users can join one tenant
    tenant_id: Optional[uuid.UUID] = Field(default=None, foreign_key="tenants.id", index=True)

    # Relationship: Many Users belong to One Tenant
    tenant: Optional[Tenant] = Relationship(back_populates="users")

    phone_number: Optional[str] = Field(alias="phoneNumber", default=None)

    # --- THE FIX ---
    model_config = ConfigDict(
        populate_by_name=True,  # Allows User(full_name="...")
        from_attributes=True  # Required for SQLModel/SQLAlchemy compatibility
    )


# --- The Main Table ---



class Service(BaseMixin, table=True):
    __tablename__ = "services"
    title: str
    slug: str = Field(index=True, unique=True)
    # Store enum as string (DB-safe)
    icon: str
    is_active: bool = Field(default=True)
    short_desc: str
    description: str
    # JSON fields
    features: List[str] = Field(
        default_factory=list,
        sa_column=Column(JSONB)
    )

    pricing: List[dict] = Field(
        default_factory=list,
        sa_column=Column(JSONB)
    )
    faqs: List[dict] = Field(
        default_factory=list,
        sa_column=Column(JSONB)
    )


class Subscription(BaseMixin, table=True):
    __tablename__ = "subscriptions"
    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True)
    plan_id: uuid.UUID = Field(foreign_key="plans.id")

    status: str = Field(default="active")  # active, trialing, past_due, canceled
    current_period_start: datetime
    current_period_end: datetime

    # External ID for M-Pesa or Stripe integration
    external_subscription_id: Optional[str] = Field(default=None)


class Plan(BaseMixin, table=True):
    __tablename__ = "plans"
    name: str  # e.g., "Developer", "Enterprise"
    price: float
    currency: str = Field(default="KES")
    interval: str = Field(default="month")  # month, year

    # Use JSONB to store limits: {"max_projects": 5, "api_calls_limit": 1000}
    features_config: dict = Field(default_factory=dict, sa_column=Column(JSONB))


class SigningKey(BaseMixin, table=True):
    """
    RSA keys for product access tokens (NetHubKe as AS).

    status: active (sign new tokens) | retiring (still in JWKS) | retired (hidden)
    Private PEM stored only on NetHubKe. Public material also in public_jwk for JWKS.
    """
    __tablename__ = "signing_keys"

    kid: str = Field(max_length=64, unique=True, index=True)
    status: str = Field(max_length=16, index=True, default="active")
    algorithm: str = Field(max_length=16, default="RS256")
    private_pem: str = Field(sa_column=Column(sa.Text, nullable=False))
    public_jwk: dict = Field(default_factory=dict, sa_column=Column(JSONB))
    retire_after: Optional[datetime] = Field(
        default=None,
        sa_type=SADateTime(timezone=True),
        sa_column_kwargs={"nullable": True},
    )
