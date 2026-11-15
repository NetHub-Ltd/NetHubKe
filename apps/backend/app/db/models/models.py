"""Domain models — identity, orgs, trusted clients, services, applications, audit."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

import sqlalchemy as sa
from sqlalchemy import Column, Text
from sqlmodel import Field

from app.db.models.base import BaseMixin


class Tenant(BaseMixin, table=True):
    """Legacy placeholder table. Prefer Organization + OrganizationMembership."""

    __tablename__ = "tenants"

    name: str = Field(index=True, max_length=255)
    email: Optional[str] = Field(default=None, max_length=320, index=True)


class Organization(BaseMixin, table=True):
    """Tenant boundary for multi-product NetHubKe resources."""

    __tablename__ = "organizations"

    name: str = Field(index=True, max_length=255)
    slug: str = Field(unique=True, index=True, max_length=128)
    status: str = Field(default="active", max_length=32, index=True)
    # active | suspended | closed


class OrganizationMembership(BaseMixin, table=True):
    """User membership in an organization (multi-org supported)."""

    __tablename__ = "organization_memberships"
    __table_args__ = (
        sa.UniqueConstraint(
            "organization_id",
            "user_id",
            name="uq_org_memberships_org_user",
        ),
        sa.Index(
            "ix_org_memberships_user_status",
            "user_id",
            "status",
        ),
    )

    organization_id: uuid.UUID = Field(foreign_key="organizations.id", index=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    role: str = Field(default="member", max_length=32, index=True)
    # owner | admin | member
    status: str = Field(default="active", max_length=32, index=True)
    # active | invited | removed
    invited_by_user_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key="users.id", index=True
    )


class User(BaseMixin, table=True):
    __tablename__ = "users"

    email: str = Field(unique=True, index=True, max_length=320)
    username: str = Field(default="", max_length=255, index=True)
    full_name: str = Field(default="", max_length=255)
    is_active: bool = Field(default=True)
    is_admin: bool = Field(default=False, index=True)
    # Platform admin (global). Org roles live on OrganizationMembership.
    # tenant_id is legacy; do not use for authorization.
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
    """OIDC client_id values allowed to call the resource server."""

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


class AuditEvent(BaseMixin, table=True):
    """Append-oriented security / privileged-action audit trail."""

    __tablename__ = "audit_events"
    __table_args__ = (
        sa.Index("ix_audit_events_action_created", "action", "created_at"),
    )

    actor_user_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key="users.id", index=True
    )
    actor_type: str = Field(default="user", max_length=32)
    # user | system | service
    action: str = Field(max_length=64, index=True)
    target_type: str = Field(default="", max_length=64, index=True)
    target_id: str = Field(default="", max_length=128, index=True)
    organization_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key="organizations.id", index=True
    )
    outcome: str = Field(default="success", max_length=32)
    # success | failure | denied
    detail: str = Field(default="", sa_column=Column(Text, nullable=False, server_default=""))
    correlation_id: str = Field(default="", max_length=128, index=True)


class Plan(BaseMixin, table=True):
    """Sellable plan for a product (Tawala, NetPay, …)."""

    __tablename__ = "plans"
    __table_args__ = (
        sa.UniqueConstraint("product", "code", name="uq_plans_product_code"),
    )

    product: str = Field(max_length=64, index=True)
    code: str = Field(max_length=64, index=True)
    name: str = Field(max_length=255)
    description: str = Field(default="", max_length=512)
    is_active: bool = Field(default=True, index=True)
    trial_days: int = Field(default=0)


class PlanEntitlement(BaseMixin, table=True):
    """Capability granted by a plan."""

    __tablename__ = "plan_entitlements"
    __table_args__ = (
        sa.UniqueConstraint(
            "plan_id", "capability", name="uq_plan_entitlements_plan_capability"
        ),
    )

    plan_id: uuid.UUID = Field(foreign_key="plans.id", index=True)
    capability: str = Field(max_length=128, index=True)
    # e.g. tawala.inventory.manage
    value_type: str = Field(default="boolean", max_length=32)
    # boolean | quota | enum
    value: str = Field(default="true", max_length=255)


class Subscription(BaseMixin, table=True):
    """Organization subscription to a product plan — NetHubKe owns lifecycle."""

    __tablename__ = "subscriptions"
    __table_args__ = (
        sa.UniqueConstraint(
            "organization_id", "product", name="uq_subscriptions_org_product"
        ),
        sa.Index("ix_subscriptions_status_period_end", "status", "current_period_end"),
    )

    organization_id: uuid.UUID = Field(foreign_key="organizations.id", index=True)
    product: str = Field(max_length=64, index=True)
    plan_id: uuid.UUID = Field(foreign_key="plans.id", index=True)
    status: str = Field(default="trial", max_length=32, index=True)
    # trial | active | past_due | canceled | suspended
    current_period_start: datetime = Field(sa_type=sa.DateTime(timezone=True))
    current_period_end: datetime = Field(sa_type=sa.DateTime(timezone=True))
    trial_end: Optional[datetime] = Field(
        default=None, sa_type=sa.DateTime(timezone=True)
    )
    cancel_at_period_end: bool = Field(default=False)
    canceled_at: Optional[datetime] = Field(
        default=None, sa_type=sa.DateTime(timezone=True)
    )


class EntitlementOverride(BaseMixin, table=True):
    """Explicit org/product capability override (grant or suspend)."""

    __tablename__ = "entitlement_overrides"
    __table_args__ = (
        sa.Index(
            "ix_entitlement_overrides_org_product",
            "organization_id",
            "product",
        ),
    )

    organization_id: uuid.UUID = Field(foreign_key="organizations.id", index=True)
    product: str = Field(max_length=64, index=True)
    capability: str = Field(max_length=128, index=True)
    value_type: str = Field(default="boolean", max_length=32)
    value: str = Field(default="true", max_length=255)
    reason: str = Field(default="", max_length=512)
    actor_user_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key="users.id", index=True
    )
    effective_from: datetime = Field(sa_type=sa.DateTime(timezone=True))
    effective_until: Optional[datetime] = Field(
        default=None, sa_type=sa.DateTime(timezone=True)
    )
    is_active: bool = Field(default=True, index=True)


class PaymentEvent(BaseMixin, table=True):
    """Idempotent payment-provider webhook record (no cardholder data)."""

    __tablename__ = "payment_events"
    __table_args__ = (
        sa.UniqueConstraint(
            "provider", "provider_event_id", name="uq_payment_events_provider_event"
        ),
        sa.UniqueConstraint("idempotency_key", name="uq_payment_events_idempotency"),
    )

    provider: str = Field(max_length=64, index=True)
    provider_event_id: str = Field(max_length=255, index=True)
    idempotency_key: str = Field(max_length=255, index=True)
    event_type: str = Field(default="", max_length=64)
    organization_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key="organizations.id", index=True
    )
    subscription_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key="subscriptions.id", index=True
    )
    product: str = Field(default="", max_length=64)
    plan_code: str = Field(default="", max_length=64)
    amount_cents: int = Field(default=0)
    currency: str = Field(default="KES", max_length=8)
    payload_hash: str = Field(default="", max_length=128)
    signature_valid: bool = Field(default=False)
    processing_result: str = Field(default="pending", max_length=32)
    # pending | activated | renewed | ignored | failed
    processed_at: Optional[datetime] = Field(
        default=None, sa_type=sa.DateTime(timezone=True)
    )
    detail: str = Field(default="", sa_column=Column(Text, nullable=False, server_default=""))
