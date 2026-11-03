"""Add durable security audit events for key operations (N5).

Revision ID: j3d4e5f6a7b8
Revises: i2c3d4e5f6a7
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "j3d4e5f6a7b8"
down_revision: Union[str, Sequence[str], None] = "i2c3d4e5f6a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "security_audit_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("actor_sub", sa.String(255), nullable=False),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("target_type", sa.String(100), nullable=False),
        sa.Column("target_id", sa.String(255), nullable=False),
        sa.Column("outcome", sa.String(32), nullable=False, server_default="success"),
        sa.Column("details", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'::jsonb")),
    )
    op.create_index("ix_security_audit_events_actor_sub", "security_audit_events", ["actor_sub"])
    op.create_index("ix_security_audit_events_action", "security_audit_events", ["action"])
    op.create_index("ix_security_audit_events_target_type", "security_audit_events", ["target_type"])
    op.create_index("ix_security_audit_events_target_id", "security_audit_events", ["target_id"])
    op.create_index("ix_security_audit_events_outcome", "security_audit_events", ["outcome"])


def downgrade() -> None:
    op.drop_index("ix_security_audit_events_outcome", table_name="security_audit_events")
    op.drop_index("ix_security_audit_events_target_id", table_name="security_audit_events")
    op.drop_index("ix_security_audit_events_target_type", table_name="security_audit_events")
    op.drop_index("ix_security_audit_events_action", table_name="security_audit_events")
    op.drop_index("ix_security_audit_events_actor_sub", table_name="security_audit_events")
    op.drop_table("security_audit_events")
