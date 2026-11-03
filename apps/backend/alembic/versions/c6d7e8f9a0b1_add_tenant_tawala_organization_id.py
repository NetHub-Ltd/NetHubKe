"""Add tenants.tawala_organization_id for Tawala hard-session link.

Revision ID: c6d7e8f9a0b1
Revises: b525eeb4600a
Create Date: 2026-09-16
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "c6d7e8f9a0b1"
down_revision: Union[str, Sequence[str], None] = "b525eeb4600a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "tenants",
        sa.Column(
            "tawala_organization_id",
            postgresql.UUID(as_uuid=True),
            nullable=True,
        ),
    )
    op.create_index(
        "ix_tenants_tawala_organization_id",
        "tenants",
        ["tawala_organization_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_tenants_tawala_organization_id", table_name="tenants")
    op.drop_column("tenants", "tawala_organization_id")
