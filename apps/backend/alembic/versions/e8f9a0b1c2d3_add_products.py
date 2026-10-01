"""Add products registry for multi-product token exchange (N3).

Revision ID: e8f9a0b1c2d3
Revises: d7e8f9a0b1c2
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "e8f9a0b1c2d3"
down_revision: Union[str, Sequence[str], None] = "d7e8f9a0b1c2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "products",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("slug", sa.String(64), nullable=False),
        sa.Column("name", sa.String(128), nullable=False),
        sa.Column("audience", sa.String(256), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("claim_profile", sa.String(64), nullable=False, server_default="tawala"),
        sa.Column("notes", sa.Text(), nullable=True),
    )
    op.create_index("ix_products_slug", "products", ["slug"], unique=True)
    op.create_index("ix_products_is_active", "products", ["is_active"], unique=False)
    # Seed Tawala from defaults (audience overridden by env at runtime for mint if needed)
    op.execute(
        """
        INSERT INTO products (slug, name, audience, is_active, claim_profile, notes)
        VALUES (
            'tawala',
            'Tawala',
            'tawala-api',
            true,
            'tawala',
            'Hard-session exchange; org_id + principal owner|terminal'
        )
        ON CONFLICT DO NOTHING
        """
    )


def downgrade() -> None:
    op.drop_index("ix_products_is_active", table_name="products")
    op.drop_index("ix_products_slug", table_name="products")
    op.drop_table("products")
