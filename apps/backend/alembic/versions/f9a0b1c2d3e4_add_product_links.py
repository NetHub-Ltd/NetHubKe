"""Add product_links tenant ↔ product ↔ external_org_id (N4).

Revision ID: f9a0b1c2d3e4
Revises: e8f9a0b1c2d3
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "f9a0b1c2d3e4"
down_revision: Union[str, Sequence[str], None] = "e8f9a0b1c2d3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "product_links",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id"), nullable=False),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("external_org_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
    )
    op.create_index("ix_product_links_tenant_id", "product_links", ["tenant_id"])
    op.create_index("ix_product_links_product_id", "product_links", ["product_id"])
    op.create_index("ix_product_links_external_org_id", "product_links", ["external_org_id"])
    op.create_unique_constraint(
        "uq_product_links_tenant_product",
        "product_links",
        ["tenant_id", "product_id"],
    )


def downgrade() -> None:
    op.drop_constraint("uq_product_links_tenant_product", "product_links", type_="unique")
    op.drop_index("ix_product_links_external_org_id", table_name="product_links")
    op.drop_index("ix_product_links_product_id", table_name="product_links")
    op.drop_index("ix_product_links_tenant_id", table_name="product_links")
    op.drop_table("product_links")
