"""Add memberships table + seed tawala-platform product (Path A).

Revision ID: i2c3d4e5f6a7
Revises: h1b2c3d4e5f6
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "i2c3d4e5f6a7"
down_revision: Union[str, Sequence[str], None] = "h1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "memberships",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            primary_key=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column(
            "tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id"), nullable=False
        ),
        sa.Column(
            "product_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("products.id"),
            nullable=False,
        ),
        sa.Column("role", sa.String(64), nullable=False),
        sa.Column("external_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.UniqueConstraint(
            "user_id",
            "tenant_id",
            "product_id",
            name="uq_memberships_user_tenant_product",
        ),
    )
    op.create_index("ix_memberships_user_id", "memberships", ["user_id"])
    op.create_index("ix_memberships_tenant_id", "memberships", ["tenant_id"])
    op.create_index("ix_memberships_product_id", "memberships", ["product_id"])
    op.create_index("ix_memberships_role", "memberships", ["role"])
    op.create_index("ix_memberships_external_user_id", "memberships", ["external_user_id"])
    op.create_index("ix_memberships_is_active", "memberships", ["is_active"])

    # Platform operators PoC product (service-agnostic products table — no new table per app)
    op.execute(
        """
        INSERT INTO products (slug, name, audience, is_active, claim_profile, notes)
        VALUES (
            'tawala-platform',
            'Tawala Platform',
            'tawala-platform',
            true,
            'tawala-platform',
            'Path A PoC: platform operators; external_user_id = PlatformUser.id; roles e.g. SUPER_ADMIN|SUPPORT|BILLING'
        )
        ON CONFLICT (slug) DO NOTHING
        """
    )
    # Ensure tenant product row remains present (idempotent)
    op.execute(
        """
        INSERT INTO products (slug, name, audience, is_active, claim_profile, notes)
        VALUES (
            'tawala',
            'Tawala',
            'tawala-api',
            true,
            'tawala',
            'Tenant staff Path A; external_user_id = Staff.id'
        )
        ON CONFLICT (slug) DO NOTHING
        """
    )


def downgrade() -> None:
    op.drop_index("ix_memberships_is_active", table_name="memberships")
    op.drop_index("ix_memberships_external_user_id", table_name="memberships")
    op.drop_index("ix_memberships_role", table_name="memberships")
    op.drop_index("ix_memberships_product_id", table_name="memberships")
    op.drop_index("ix_memberships_tenant_id", table_name="memberships")
    op.drop_index("ix_memberships_user_id", table_name="memberships")
    op.drop_table("memberships")
    op.execute("DELETE FROM products WHERE slug = 'tawala-platform'")
