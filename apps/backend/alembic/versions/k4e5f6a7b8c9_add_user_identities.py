"""Add canonical upstream identity mappings.

Revision ID: k4e5f6a7b8c9
Revises: j3d4e5f6a7b8
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "k4e5f6a7b8c9"
down_revision: Union[str, Sequence[str], None] = "j3d4e5f6a7b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "user_identities",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("issuer", sa.String(512), nullable=False),
        sa.Column("subject", sa.String(512), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.UniqueConstraint("issuer", "subject", name="uq_user_identities_issuer_subject"),
        sa.UniqueConstraint("user_id", "issuer", name="uq_user_identities_user_issuer"),
    )
    op.create_index("ix_user_identities_issuer", "user_identities", ["issuer"])
    op.create_index("ix_user_identities_subject", "user_identities", ["subject"])
    op.create_index("ix_user_identities_user_id", "user_identities", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_user_identities_user_id", table_name="user_identities")
    op.drop_index("ix_user_identities_subject", table_name="user_identities")
    op.drop_index("ix_user_identities_issuer", table_name="user_identities")
    op.drop_table("user_identities")
