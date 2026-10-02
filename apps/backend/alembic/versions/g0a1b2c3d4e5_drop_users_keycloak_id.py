"""drop users.keycloak_id — IdP-agnostic identity via email

Revision ID: g0a1b2c3d4e5
Revises: a0b1c2d3e4f5
Create Date: 2026-10-02
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "g0a1b2c3d4e5"
down_revision: Union[str, None] = "a0b1c2d3e4f5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index(op.f("ix_users_keycloak_id"), table_name="users")
    op.drop_column("users", "keycloak_id")
    # Enforce unique email for sync-by-email
    try:
        op.create_unique_constraint("uq_users_email", "users", ["email"])
    except Exception:
        # Index may already imply uniqueness on some deployments
        pass


def downgrade() -> None:
    try:
        op.drop_constraint("uq_users_email", "users", type_="unique")
    except Exception:
        pass
    op.add_column(
        "users",
        sa.Column("keycloak_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_index(op.f("ix_users_keycloak_id"), "users", ["keycloak_id"], unique=True)
