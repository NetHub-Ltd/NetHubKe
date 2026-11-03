"""Harden users.email uniqueness for IdP-agnostic identity

Revision ID: h1b2c3d4e5f6
Revises: g0a1b2c3d4e5
Create Date: 2026-10-03

Follow-up to g0a1b2c3d4e5 which dropped keycloak_id and attempted
uq_users_email inside a bare try/except (constraint could be missing
if duplicates existed or the create failed silently).

This revision:
1. Normalizes existing emails (trim + lower).
2. Fails loudly if duplicate emails remain after normalization
   (no silent data merge — operator must resolve collisions).
3. Ensures unique constraint uq_users_email exists.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "h1b2c3d4e5f6"
down_revision: Union[str, None] = "g0a1b2c3d4e5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    # 1) Normalize emails in place (matches app _norm_email)
    conn.execute(
        sa.text(
            "UPDATE users SET email = lower(btrim(email)) "
            "WHERE email IS NOT NULL AND email <> lower(btrim(email))"
        )
    )

    # 2) Detect collisions after normalize — do not merge rows
    rows = conn.execute(
        sa.text(
            """
            SELECT lower(btrim(email)) AS norm_email, COUNT(*) AS cnt,
                   array_agg(id::text ORDER BY created_at NULLS LAST, id) AS user_ids
            FROM users
            WHERE email IS NOT NULL AND btrim(email) <> ''
            GROUP BY lower(btrim(email))
            HAVING COUNT(*) > 1
            ORDER BY cnt DESC, norm_email
            """
        )
    ).fetchall()

    if rows:
        detail_lines = [
            f"  email={r[0]!r} count={r[1]} user_ids={r[2]}" for r in rows
        ]
        detail = "\n".join(detail_lines)
        raise RuntimeError(
            "Cannot enforce unique users.email: duplicate emails after normalization.\n"
            "Resolve collisions manually (merge or reassign), then re-run migrations.\n"
            f"{detail}"
        )

    # 3) Ensure unique constraint exists (idempotent)
    exists = conn.execute(
        sa.text(
            """
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'uq_users_email'
              AND conrelid = 'users'::regclass
            """
        )
    ).fetchone()

    if not exists:
        # Also drop non-unique index name collision if any leftover blocks create
        op.create_unique_constraint("uq_users_email", "users", ["email"])


def downgrade() -> None:
    conn = op.get_bind()
    exists = conn.execute(
        sa.text(
            """
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'uq_users_email'
              AND conrelid = 'users'::regclass
            """
        )
    ).fetchone()
    if exists:
        op.drop_constraint("uq_users_email", "users", type_="unique")
