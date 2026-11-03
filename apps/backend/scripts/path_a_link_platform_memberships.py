#!/usr/bin/env python3
"""Create/update NetHubKe users + tawala-platform memberships from Tawala export (#540).

Input: JSON from Tawala path_a_export_platform_users.py
  { "product": "tawala-platform", "users": [ { email, external_user_id, role, full_name, active } ] }

Does NOT touch Tawala DB. Writes mapping JSON with nethub_user_id filled in.

Usage (from apps/backend):
  uv run python scripts/path_a_link_platform_memberships.py --in export.json --out mapping.json
  uv run python scripts/path_a_link_platform_memberships.py --in export.json --out mapping.json --apply
"""
from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path
from uuid import UUID

from sqlmodel import select


def _norm_email(email: str) -> str:
    return (email or "").strip().lower()


async def _run(inp: Path, out: Path, *, apply: bool, product_slug: str) -> int:
    from app.db.models.models import Membership, Product, User
    from app.db.session import AsyncSessionLocal

    data = json.loads(inp.read_text())
    users_in = data.get("users") or []
    product_slug = (data.get("product") or product_slug or "tawala-platform").strip().lower()

    results = []
    async with AsyncSessionLocal() as db:
        product = (
            await db.exec(
                select(Product).where(
                    Product.slug == product_slug,
                    Product.is_active == True,  # noqa: E712
                )
            )
        ).first()
        if not product:
            print(f"ERROR: product slug={product_slug} not found or inactive", file=sys.stderr)
            return 1

        for row in users_in:
            email = _norm_email(str(row.get("email") or ""))
            ext_raw = row.get("external_user_id")
            role = str(row.get("role") or "SUPPORT").strip() or "SUPPORT"
            full_name = (row.get("full_name") or email or "Platform User").strip()
            if not email or not ext_raw:
                print(f"SKIP incomplete row: {row}")
                continue
            try:
                external_user_id = UUID(str(ext_raw))
            except ValueError:
                print(f"SKIP bad external_user_id: {ext_raw}")
                continue

            user = (await db.exec(select(User).where(User.email == email))).first()
            if user is None:
                # Minimal user; tenant left null until first /users/sync — membership needs tenant_id
                # Create personal tenant-style row aligned with user_crud.get_or_create_tenancy
                from app.db.models.models import Tenant

                tenant = (
                    await db.exec(select(Tenant).where(Tenant.email == email))
                ).first()
                if tenant is None and apply:
                    tenant = Tenant(name=f"{email}-platform", email=email)
                    db.add(tenant)
                    await db.flush()
                elif tenant is None:
                    print(f"DRY: would create tenant+user for {email}")
                    results.append(
                        {
                            **row,
                            "nethub_user_id": None,
                            "status": "would_create_user",
                        }
                    )
                    continue

                if apply:
                    user = User(
                        email=email,
                        username=email.split("@")[0] or "platform",
                        full_name=full_name,
                        is_active=True,
                        tenant_id=tenant.id,
                    )
                    db.add(user)
                    await db.flush()
                    print(f"CREATE user {email} id={user.id}")
                else:
                    results.append({**row, "nethub_user_id": None, "status": "would_create_user"})
                    continue
            else:
                if apply and not user.is_active:
                    user.is_active = True
                    db.add(user)
                if apply and user.tenant_id is None:
                    from app.db.models.models import Tenant

                    tenant = (
                        await db.exec(select(Tenant).where(Tenant.email == email))
                    ).first()
                    if tenant is None:
                        tenant = Tenant(name=f"{email}-platform", email=email)
                        db.add(tenant)
                        await db.flush()
                    user.tenant_id = tenant.id
                    db.add(user)
                    await db.flush()

            assert user is not None
            if not user.tenant_id:
                print(f"ERROR: user {email} has no tenant_id", file=sys.stderr)
                results.append({**row, "nethub_user_id": str(user.id), "status": "no_tenant"})
                continue

            mem = (
                await db.exec(
                    select(Membership).where(
                        Membership.user_id == user.id,
                        Membership.tenant_id == user.tenant_id,
                        Membership.product_id == product.id,
                    )
                )
            ).first()

            if mem is None:
                if apply:
                    mem = Membership(
                        user_id=user.id,
                        tenant_id=user.tenant_id,
                        product_id=product.id,
                        role=role,
                        external_user_id=external_user_id,
                        is_active=True,
                    )
                    db.add(mem)
                    print(f"CREATE membership {email} role={role} external={external_user_id}")
                else:
                    print(f"DRY: would create membership {email} role={role}")
            else:
                if apply:
                    changed = False
                    if mem.external_user_id != external_user_id:
                        mem.external_user_id = external_user_id
                        changed = True
                    if mem.role != role:
                        mem.role = role
                        changed = True
                    if not mem.is_active:
                        mem.is_active = True
                        changed = True
                    if changed:
                        db.add(mem)
                        print(f"UPDATE membership {email}")
                    else:
                        print(f"OK membership {email}")
                else:
                    print(f"DRY: membership exists {email} external={mem.external_user_id}")

            results.append(
                {
                    "email": email,
                    "external_user_id": str(external_user_id),
                    "role": role,
                    "full_name": full_name,
                    "nethub_user_id": str(user.id),
                    "status": "ok" if apply or mem is not None else "dry",
                }
            )

        if apply:
            await db.commit()

    out.write_text(json.dumps({"product": product_slug, "users": results}, indent=2) + "\n")
    print(f"Wrote mapping → {out} ({len(results)} rows) apply={apply}")
    return 0


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--in", dest="inp", type=Path, required=True)
    p.add_argument("--out", type=Path, default=Path("platform_users_path_a_mapping.json"))
    p.add_argument("--apply", action="store_true")
    p.add_argument("--product", default="tawala-platform")
    args = p.parse_args()
    return asyncio.run(_run(args.inp, args.out, apply=args.apply, product_slug=args.product))


if __name__ == "__main__":
    raise SystemExit(main())
