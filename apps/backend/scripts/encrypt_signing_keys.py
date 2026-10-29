"""Encrypt existing signing_keys private PEM rows in place (N2 rollout helper).

Run from apps/backend with SIGNING_KEY_ENCRYPTION_KEY set and
ENVIRONMENT=development. Default is dry-run; pass --apply to commit.
Back up PostgreSQL and retain the encryption key before applying.
"""
from __future__ import annotations

import argparse
import asyncio

from sqlmodel import select

from app.core.config import settings
from app.db.models.models import SigningKey
from app.db.session import AsyncSessionLocal
from app.services.tawala_token import (
    _ENCRYPTED_PEM_PREFIX,
    _protect_private_pem,
    _unprotect_private_pem,
)


async def migrate(*, apply: bool) -> int:
    if not settings.signing_key_encryption_key:
        raise RuntimeError("SIGNING_KEY_ENCRYPTION_KEY is required")
    async with AsyncSessionLocal() as db:
        rows = list(await db.exec(select(SigningKey).where(SigningKey.deleted_at.is_(None))))
        changed = 0
        for row in rows:
            stored = row.private_pem
            protected = _protect_private_pem(stored)
            # Verify before any write; no private material is printed.
            _unprotect_private_pem(protected)
            if not stored.startswith(_ENCRYPTED_PEM_PREFIX):
                row.private_pem = protected
                db.add(row)
                changed += 1
        if apply:
            await db.commit()
        else:
            await db.rollback()
    print(f"{'Applied' if apply else 'Dry run'}: {changed} signing key row(s) would be encrypted.")
    return changed


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="Commit encrypted rows; otherwise roll back.")
    args = parser.parse_args()
    asyncio.run(migrate(apply=args.apply))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
