"""Deactivate the unsupported legacy Tawala Path A product.

Revision ID: n7h8i9j0k1l2
Revises: m6g7h8i9j0k1
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "n7h8i9j0k1l2"
down_revision: Union[str, Sequence[str], None] = "m6g7h8i9j0k1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Preserve historical references; only disable the unsupported claim profile.
    op.get_bind().execute(
        sa.text(
            "UPDATE products SET is_active = FALSE "
            "WHERE slug = :slug AND is_active IS TRUE"
        ),
        {"slug": "tawala-platform"},
    )


def downgrade() -> None:
    # Intentionally do not reactivate the legacy product on schema rollback.
    pass
