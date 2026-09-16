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
    pem = (getattr(settings, "tawala_jwt_private_key", None) or "").strip()
    if not pem:
        return None
    pem = pem.replace("\\n", "\n")
    return serialization.load_pem_private_key(pem.encode("utf-8"), password=None)


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
    for row in rows:
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
    if not exchange_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Tawala token exchange is not enabled",
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
        "iss": settings.tawala_jwt_issuer,
        "aud": settings.tawala_jwt_audience,
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
