"""trusted clients, services, applications, is_admin

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-11-05
"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("is_admin", sa.Boolean(), server_default=sa.text("false"), nullable=False),
    )
    op.create_index("ix_users_is_admin", "users", ["is_admin"])

    op.create_table(
        "trusted_clients",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("client_id", sa.String(length=128), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("product", sa.String(length=64), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes", sa.String(length=512), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("client_id"),
    )
    op.create_index("ix_trusted_clients_client_id", "trusted_clients", ["client_id"])
    op.create_index("ix_trusted_clients_is_active", "trusted_clients", ["is_active"])

    op.create_table(
        "services",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("slug", sa.String(length=128), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("short_title", sa.String(length=128), nullable=False),
        sa.Column("summary", sa.String(length=512), nullable=False),
        sa.Column("accepts_applications", sa.Boolean(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_services_slug", "services", ["slug"])
    op.create_index("ix_services_is_active", "services", ["is_active"])

    op.create_table(
        "service_applications",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("service_id", sa.Uuid(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("body", sa.Text(), server_default="", nullable=False),
        sa.Column("budget_band", sa.String(length=64), nullable=False),
        sa.Column("timeline", sa.String(length=128), nullable=False),
        sa.Column("contact_phone", sa.String(length=64), nullable=False),
        sa.ForeignKeyConstraint(["service_id"], ["services.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_service_applications_user_id", "service_applications", ["user_id"])
    op.create_index("ix_service_applications_status", "service_applications", ["status"])
    op.create_index(
        "ix_service_applications_user_status",
        "service_applications",
        ["user_id", "status"],
    )

    op.create_table(
        "application_messages",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("application_id", sa.Uuid(), nullable=False),
        sa.Column("author_user_id", sa.Uuid(), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("is_from_admin", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["application_id"], ["service_applications.id"]),
        sa.ForeignKeyConstraint(["author_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_application_messages_application_id", "application_messages", ["application_id"]
    )


def downgrade() -> None:
    op.drop_table("application_messages")
    op.drop_table("service_applications")
    op.drop_table("services")
    op.drop_table("trusted_clients")
    op.drop_index("ix_users_is_admin", table_name="users")
    op.drop_column("users", "is_admin")
