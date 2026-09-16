"""Add signing_keys for managed AS keyring (N2).

Revision ID: d7e8f9a0b1c2
Revises: c6d7e8f9a0b1
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "d7e8f9a0b1c2"
down_revision: Union[str, Sequence[str], None] = "c6d7e8f9a0b1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "signing_keys",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("kid", sa.String(64), nullable=False),
        sa.Column("status", sa.String(16), nullable=False, server_default="active"),
        sa.Column("algorithm", sa.String(16), nullable=False, server_default="RS256"),
        sa.Column("private_pem", sa.Text(), nullable=False),
        sa.Column("public_jwk", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("retire_after", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_signing_keys_kid", "signing_keys", ["kid"], unique=True)
    op.create_index("ix_signing_keys_status", "signing_keys", ["status"])


def downgrade() -> None:
    op.drop_table("signing_keys")
