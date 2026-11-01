"""Enforce unique JWT audiences across registered products.

Revision ID: m6g7h8i9j0k1
Revises: l5f6a7b8c9d0
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "m6g7h8i9j0k1"
down_revision: Union[str, Sequence[str], None] = "l5f6a7b8c9d0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Never rewrite audiences silently: that could invalidate deployed verifiers.
    duplicates = op.get_bind().execute(
        sa.text(
            "SELECT audience, array_agg(slug ORDER BY slug) AS slugs "
            "FROM products GROUP BY audience HAVING count(*) > 1"
        )
    ).all()
    if duplicates:
        details = "; ".join(
            f"{row.audience!r}: {', '.join(row.slugs)}" for row in duplicates
        )
        raise RuntimeError(
            "Cannot enforce unique product audiences; resolve duplicate rows "
            f"without changing deployed verifier contracts, then retry: {details}"
        )
    op.create_index("uq_products_audience", "products", ["audience"], unique=True)


def downgrade() -> None:
    op.drop_index("uq_products_audience", table_name="products")
