"""organizations, memberships, audit_events

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-11-15
"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, None] = "b2c3d4e5f6a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "organizations",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=128), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_organizations_name", "organizations", ["name"])
    op.create_index("ix_organizations_slug", "organizations", ["slug"])
    op.create_index("ix_organizations_status", "organizations", ["status"])

    op.create_table(
        "organization_memberships",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("organization_id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("role", sa.String(length=32), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("invited_by_user_id", sa.Uuid(), nullable=True),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["invited_by_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "organization_id", "user_id", name="uq_org_memberships_org_user"
        ),
    )
    op.create_index(
        "ix_organization_memberships_organization_id",
        "organization_memberships",
        ["organization_id"],
    )
    op.create_index(
        "ix_organization_memberships_user_id",
        "organization_memberships",
        ["user_id"],
    )
    op.create_index(
        "ix_org_memberships_user_status",
        "organization_memberships",
        ["user_id", "status"],
    )
    op.create_index(
        "ix_organization_memberships_role",
        "organization_memberships",
        ["role"],
    )
    op.create_index(
        "ix_organization_memberships_status",
        "organization_memberships",
        ["status"],
    )

    op.create_table(
        "audit_events",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("actor_user_id", sa.Uuid(), nullable=True),
        sa.Column("actor_type", sa.String(length=32), nullable=False),
        sa.Column("action", sa.String(length=64), nullable=False),
        sa.Column("target_type", sa.String(length=64), nullable=False),
        sa.Column("target_id", sa.String(length=128), nullable=False),
        sa.Column("organization_id", sa.Uuid(), nullable=True),
        sa.Column("outcome", sa.String(length=32), nullable=False),
        sa.Column("detail", sa.Text(), server_default="", nullable=False),
        sa.Column("correlation_id", sa.String(length=128), nullable=False),
        sa.ForeignKeyConstraint(["actor_user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_audit_events_actor_user_id", "audit_events", ["actor_user_id"])
    op.create_index("ix_audit_events_action", "audit_events", ["action"])
    op.create_index("ix_audit_events_target_type", "audit_events", ["target_type"])
    op.create_index("ix_audit_events_target_id", "audit_events", ["target_id"])
    op.create_index("ix_audit_events_organization_id", "audit_events", ["organization_id"])
    op.create_index("ix_audit_events_correlation_id", "audit_events", ["correlation_id"])
    op.create_index(
        "ix_audit_events_action_created", "audit_events", ["action", "created_at"]
    )


def downgrade() -> None:
    op.drop_table("audit_events")
    op.drop_table("organization_memberships")
    op.drop_table("organizations")
