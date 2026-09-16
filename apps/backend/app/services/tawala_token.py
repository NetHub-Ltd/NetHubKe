"""Product access-token signing (NetHubKe AS) — N2 managed keys + Redis JWKS cache.

Priority for private key material:
1. Active row in signing_keys (Postgres)
2. Bootstrap: generate RSA and insert if exchange enabled and table empty
3. Fallback: TAWALA_JWT_PRIVATE_KEY env PEM (dev/emergency only)
"""
from __future__ import annotations

import base64
import json
import time
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Optional, Tuple
from uuid import UUID

import jwt
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi import HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.config import settings
from app.core.redis_client import (
    ACTIVE_KID_CACHE_KEY,
    JWKS_CACHE_KEY,
    redis_delete,
    redis_get,
    redis_set,
)
from app.db.models.models import SigningKey
from app.utils.logging import logger


def exchange_enabled() -> bool:
    return bool(getattr(settings, "tawala_exchange_enabled", False))


def _b64url_uint(val: int) -> str:
    length = (val.bit_length() + 7) // 8
    raw = val.to_bytes(length, byteorder="big")
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def public_jwk_from_private(private_key, kid: str) -> dict[str, Any]:
    numbers = private_key.public_key().public_numbers()
    return {
        "kty": "RSA",
        "use": "sig",
        "alg": "RS256",
        "kid": kid,
        "n": _b64url_uint(numbers.n),
        "e": _b64url_uint(numbers.e),
    }


def _load_env_private_key():
    """
    Load optional env PEM for emergency/dev bootstrap.

    Returns None if unset, empty, or **not a valid PEM** (never raises).
    Misconfigured secrets (hex tokens, JWT strings, etc.) must not 500 JWKS.
    """
    pem = (getattr(settings, "tawala_jwt_private_key", None) or "").strip()
    if not pem:
        return None
    pem = pem.replace("\\n", "\n")
    # Quick reject of clearly non-PEM material (common misconfig: hex secret / password)
    if "BEGIN" not in pem.upper():
        logger.warning(
            "TAWALA_JWT_PRIVATE_KEY is set but is not PEM (missing BEGIN); ignoring env key"
        )
        return None
    try:
        return serialization.load_pem_private_key(pem.encode("utf-8"), password=None)
    except Exception as exp:  # noqa: BLE001
        logger.warning(
            f"TAWALA_JWT_PRIVATE_KEY is set but failed to parse as PEM; ignoring env key: {exp}"
        )
        return None

def _generate_rsa_keypair():
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    private_pem = key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode("utf-8")
    kid = f"nethub-{uuid.uuid4().hex[:12]}"
    jwk = public_jwk_from_private(key, kid)
    return kid, private_pem, jwk, key


async def invalidate_jwks_cache() -> None:
    await redis_delete(JWKS_CACHE_KEY, ACTIVE_KID_CACHE_KEY)


async def rotate_signing_key(
    db: AsyncSession,
    *,
    retire_after_hours: int = 24,
) -> dict[str, Any]:
    """
    N5: Create a new active signing key; mark previous active key(s) as retiring.

    JWKS continues to publish active + retiring until retire_after, then keys
    should be marked retired (see prune_expired_retiring_keys).
    Redis JWKS / active-kid caches are purged immediately.
    """
    hours = max(1, int(retire_after_hours))
    retire_at = datetime.now(timezone.utc) + timedelta(hours=hours)

    active_rows = list(
        await db.exec(
            select(SigningKey).where(
                SigningKey.status == "active",
                SigningKey.deleted_at.is_(None),
            )
        )
    )
    for row in active_rows:
        row.status = "retiring"
        row.retire_after = retire_at
        db.add(row)

    kid, pem, jwk, _ = _generate_rsa_keypair()
    new_row = SigningKey(
        kid=kid,
        status="active",
        algorithm="RS256",
        private_pem=pem,
        public_jwk=jwk,
    )
    db.add(new_row)
    await db.commit()
    await db.refresh(new_row)
    await invalidate_jwks_cache()
    logger.info(
        f"Rotated signing key new_kid={kid} retiring={[r.kid for r in active_rows]} retire_after={retire_at.isoformat()}"
    )
    return {
        "new_kid": kid,
        "retiring_kids": [r.kid for r in active_rows],
        "retire_after": retire_at.isoformat(),
    }


async def prune_expired_retiring_keys(db: AsyncSession) -> int:
    """Mark retiring keys past retire_after as retired; purge JWKS cache if any changed."""
    now = datetime.now(timezone.utc)
    rows = list(
        await db.exec(
            select(SigningKey).where(
                SigningKey.status == "retiring",
                SigningKey.deleted_at.is_(None),
            )
        )
    )
    changed = 0
    for row in rows:
        if row.retire_after is not None and row.retire_after <= now:
            row.status = "retired"
            db.add(row)
            changed += 1
    if changed:
        await db.commit()
        await invalidate_jwks_cache()
        logger.info(f"Pruned {changed} retiring signing keys to retired")
    return changed


async def bootstrap_signing_key(db: AsyncSession) -> SigningKey:
    """Create first active key if none exist. Prefer env PEM material if set."""
    env_key = _load_env_private_key()
    if env_key is not None:
        kid = "nethub-env-bootstrap"
        pem = (settings.tawala_jwt_private_key or "").strip().replace("\\n", "\n")
        jwk = public_jwk_from_private(env_key, kid)
    else:
        kid, pem, jwk, _ = _generate_rsa_keypair()

    row = SigningKey(
        kid=kid,
        status="active",
        algorithm="RS256",
        private_pem=pem,
        public_jwk=jwk,
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    await invalidate_jwks_cache()
    logger.info(f"Bootstrapped signing key kid={kid}")
    return row


async def get_active_signing_key(db: AsyncSession) -> Tuple[Any, str]:
    """
    Return (private_key object, kid) for minting.
    """
    stmt = select(SigningKey).where(
        SigningKey.status == "active",
        SigningKey.deleted_at.is_(None),
    )
    row = (await db.exec(stmt)).first()
    if row is None:
        if not exchange_enabled():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Tawala token exchange is not enabled",
            )
        row = await bootstrap_signing_key(db)

    private_key = serialization.load_pem_private_key(
        row.private_pem.encode("utf-8"), password=None
    )
    await redis_set(ACTIVE_KID_CACHE_KEY, row.kid, int(getattr(settings, "jwks_redis_ttl_sec", 120)))
    return private_key, row.kid


async def build_jwks_document(db: AsyncSession) -> dict[str, Any]:
    """JWKS for active + retiring keys (not retired)."""
    cached = await redis_get(JWKS_CACHE_KEY)
    if cached:
        try:
            return json.loads(cached)
        except json.JSONDecodeError:
            pass

    stmt = select(SigningKey).where(
        SigningKey.status.in_(["active", "retiring"]),
        SigningKey.deleted_at.is_(None),
    )
    rows = list(await db.exec(stmt))
    keys = []
    now = datetime.now(timezone.utc)
    for row in rows:
        if row.status == "retiring" and row.retire_after is not None and row.retire_after <= now:
            continue  # treat as retired for JWKS until prune job runs
        jwk = row.public_jwk or {}
        if jwk:
            keys.append(jwk)

    # Fallback: env-only until first bootstrap
    if not keys:
        env_key = _load_env_private_key()
        if env_key is not None:
            keys.append(public_jwk_from_private(env_key, "nethub-env-bootstrap"))

    doc = {"keys": keys}
    ttl = int(getattr(settings, "jwks_redis_ttl_sec", 120))
    await redis_set(JWKS_CACHE_KEY, json.dumps(doc), ttl)
    return doc


def get_jwks() -> dict[str, Any]:
    """Sync fallback (env only) — prefer async build_jwks_document in routes."""
    env_key = _load_env_private_key()
    if env_key is None:
        return {"keys": []}
    return {"keys": [public_jwk_from_private(env_key, "nethub-env-bootstrap")]}


async def mint_tawala_access_token(
    db: AsyncSession,
    *,
    sub: str,
    org_id: UUID,
    principal: str,
    email: Optional[str] = None,
) -> tuple[str, int]:
    """Backward-compatible Tawala mint; delegates to product mint."""
    return await mint_product_access_token(
        db,
        product_slug="tawala",
        audience=getattr(settings, "tawala_jwt_audience", "tawala-api") or "tawala-api",
        sub=sub,
        org_id=org_id,
        principal=principal,
        email=email,
    )


async def get_product_by_slug(db: AsyncSession, slug: str):
    """Load active product by slug or raise 404/400."""
    from app.db.models.models import Product
    from sqlmodel import select

    normalized = (slug or "").strip().lower()
    if not normalized:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="product is required",
        )
    row = (
        await db.exec(
            select(Product).where(
                Product.slug == normalized,
                Product.deleted_at.is_(None),  # type: ignore[union-attr]
            )
        )
    ).first()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown product: {normalized}",
        )
    if not row.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Product is not active: {normalized}",
        )
    return row


async def ensure_tawala_product(db: AsyncSession):
    """Idempotent seed of tawala product from settings (dev convenience)."""
    from app.db.models.models import Product
    from sqlmodel import select

    existing = (
        await db.exec(select(Product).where(Product.slug == "tawala"))
    ).first()
    if existing:
        return existing
    row = Product(
        slug="tawala",
        name="Tawala",
        audience=getattr(settings, "tawala_jwt_audience", "tawala-api") or "tawala-api",
        is_active=True,
        claim_profile="tawala",
        notes="Hard-session exchange; org_id + principal owner|terminal",
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return row


async def mint_product_access_token(
    db: AsyncSession,
    *,
    product_slug: str,
    audience: str,
    sub: str,
    org_id: UUID,
    principal: str,
    email: Optional[str] = None,
) -> tuple[str, int]:
    """Mint RS256 product access token using managed signing key."""
    if not exchange_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Token exchange is not enabled",
        )
    if principal not in ("owner", "terminal"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="principal must be owner or terminal",
        )

    private_key, kid = await get_active_signing_key(db)
    now = int(time.time())
    ttl = int(getattr(settings, "tawala_jwt_ttl_sec", 28800))
    exp = now + ttl
    claims: dict[str, Any] = {
        "sub": str(sub),
        "org_id": str(org_id),
        "principal": principal,
        "product": product_slug,
        "iss": settings.tawala_jwt_issuer,
        "aud": audience,
        "iat": now,
        "exp": exp,
    }
    if email:
        claims["email"] = email

    token = jwt.encode(
        claims,
        private_key,
        algorithm="RS256",
        headers={"kid": kid},
    )
    return token, exp

