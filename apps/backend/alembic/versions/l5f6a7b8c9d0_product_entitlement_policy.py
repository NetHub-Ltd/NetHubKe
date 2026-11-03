"""Add product-scoped entitlement policy and overrides.

Revision ID: l5f6a7b8c9d0
Revises: k4e5f6a7b8c9
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "l5f6a7b8c9d0"
down_revision: Union[str, Sequence[str], None] = "k4e5f6a7b8c9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Interpret pre-existing naive subscription period values as UTC.
    op.alter_column("subscriptions", "current_period_start",
        existing_type=sa.DateTime(), type_=sa.DateTime(timezone=True),
        postgresql_using="current_period_start AT TIME ZONE 'UTC'")
    op.alter_column("subscriptions", "current_period_end",
        existing_type=sa.DateTime(), type_=sa.DateTime(timezone=True),
        postgresql_using="current_period_end AT TIME ZONE 'UTC'")
    op.add_column("products", sa.Column("entitlement_policy", sa.String(40),
                  nullable=False, server_default="organization_or_individual"))
    op.create_index("ix_products_entitlement_policy", "products", ["entitlement_policy"])
    op.create_check_constraint(
        "ck_products_entitlement_policy", "products",
        "entitlement_policy IN ('organization_only', 'individual_only', 'organization_or_individual', 'organization_and_individual')",
    )
    # Preserve legacy subscriptions without guessing which product owns them.
    op.add_column("subscriptions", sa.Column(
        "product_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("products.id"), nullable=True
    ))
    op.create_index("ix_subscriptions_product_id", "subscriptions", ["product_id"])
    op.create_table(
        "entitlement_overrides",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("granted_by_sub", sa.String(255), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("revoked_by_sub", sa.String(255), nullable=True),
    )
    for column in ("product_id", "tenant_id", "user_id", "granted_by_sub"):
        op.create_index(f"ix_entitlement_overrides_{column}", "entitlement_overrides", [column])

def downgrade() -> None:
    for column in ("granted_by_sub", "user_id", "tenant_id", "product_id"):
        op.drop_index(f"ix_entitlement_overrides_{column}", table_name="entitlement_overrides")
    op.drop_table("entitlement_overrides")
    op.drop_index("ix_subscriptions_product_id", table_name="subscriptions")
    op.drop_column("subscriptions", "product_id")
    op.alter_column("subscriptions", "current_period_end",
        existing_type=sa.DateTime(timezone=True), type_=sa.DateTime(),
        postgresql_using="current_period_end AT TIME ZONE 'UTC'")
    op.alter_column("subscriptions", "current_period_start",
        existing_type=sa.DateTime(timezone=True), type_=sa.DateTime(),
        postgresql_using="current_period_start AT TIME ZONE 'UTC'")
    op.drop_constraint("ck_products_entitlement_policy", "products", type_="check")
    op.drop_index("ix_products_entitlement_policy", table_name="products")
    op.drop_column("products", "entitlement_policy")
