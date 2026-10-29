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
from cryptography.fernet import Fernet, InvalidToken
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi import HTTPException, status
from sqlalchemy import text
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
from app.db.models.models import SecurityAuditEvent, SigningKey
from app.utils.logging import logger


def exchange_enabled() -> bool:
    return bool(getattr(settings, "tawala_exchange_enabled", False))


_ENCRYPTED_PEM_PREFIX = "enc:v1:"


def _require_signing_key_encryption() -> str | None:
    """Validate the optional Fernet key; production refuses unencrypted key custody."""
    configured = getattr(settings, "signing_key_encryption_key", "") or ""
    environment = getattr(settings, "environment", "development")
    environment = getattr(environment, "value", environment)
    if environment == "production" and not configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Signing-key encryption is required in production",
        )
    if configured:
        try:
            Fernet(configured.encode("ascii"))
        except (ValueError, UnicodeEncodeError) as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Signing-key encryption configuration is invalid",
            ) from exc
    return configured or None


def _protect_private_pem(private_pem: str) -> str:
    if private_pem.startswith(_ENCRYPTED_PEM_PREFIX):
        return private_pem
    key = _require_signing_key_encryption()
    if key is None:
        return private_pem
    token = Fernet(key.encode("ascii")).encrypt(private_pem.encode("utf-8")).decode("ascii")
    return _ENCRYPTED_PEM_PREFIX + token


def _unprotect_private_pem(stored_value: str) -> str:
    key = _require_signing_key_encryption()
    if stored_value.startswith(_ENCRYPTED_PEM_PREFIX):
        if key is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Signing-key encryption key is required to use stored signing keys",
            )
        try:
            return Fernet(key.encode("ascii")).decrypt(
                stored_value[len(_ENCRYPTED_PEM_PREFIX):].encode("ascii")
            ).decode("utf-8")
        except (InvalidToken, ValueError, UnicodeEncodeError) as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Stored signing key could not be decrypted",
            ) from exc

    environment = getattr(settings, "environment", "development")
    environment = getattr(environment, "value", environment)
    if environment == "production":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Legacy plaintext signing key must be migrated before production use",
        )
    return stored_value


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
    # Env PEM disabled by default — keys are generated and stored in Postgres.
    if not bool(getattr(settings, "tawala_jwt_allow_env_pem", False)):
        return None
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
    actor_sub: str | None = None,
) -> dict[str, Any]:
    """
    N5: Create a new active signing key; mark previous active key(s) as retiring.

    JWKS continues to publish active + retiring until retire_after, then keys
    should be marked retired (see prune_expired_retiring_keys).
    Redis JWKS / active-kid caches are purged immediately.
    """
    hours = max(1, int(retire_after_hours))
    retire_at = datetime.now(timezone.utc) + timedelta(hours=hours)

    # Serialize concurrent rotations so only one rotation operation proceeds at a time.
    await db.exec(text("SELECT pg_advisory_xact_lock(732104219)"))
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
        private_pem=_protect_private_pem(pem),
        public_jwk=jwk,
    )
    db.add(new_row)
    db.add(SecurityAuditEvent(
        actor_sub=actor_sub or "system:auto-rotation",
        action="signing_key.rotate",
        target_type="signing_key",
        target_id=kid,
        outcome="success",
        details={
            "new_kid": kid,
            "retiring_kids": [r.kid for r in active_rows],
            "retire_after": retire_at.isoformat(),
        },
    ))
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


async def emergency_revoke_signing_key(
    db: AsyncSession,
    *,
    kid: str,
    actor_sub: str,
) -> dict[str, Any]:
    """Immediately retire a compromised key, replacing it first if it is active."""
    await db.exec(text("SELECT pg_advisory_xact_lock(732104219)"))
    target = (
        await db.exec(
            select(SigningKey).where(
                SigningKey.kid == kid,
                SigningKey.deleted_at.is_(None),
            )
        )
    ).first()
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Signing key not found")

    now = datetime.now(timezone.utc)
    previous_status = target.status
    replacement_kid: str | None = None
    if target.status == "active":
        overlap_hours = max(1, int(getattr(settings, "signing_key_retire_overlap_hours", 24) or 24))
        retire_at = now + timedelta(hours=overlap_hours)
        active_rows = list(
            await db.exec(
                select(SigningKey).where(
                    SigningKey.status == "active",
                    SigningKey.deleted_at.is_(None),
                )
            )
        )
        for row in active_rows:
            if row.kid == kid:
                row.status = "retired"
                row.retire_after = now
            else:
                row.status = "retiring"
                row.retire_after = retire_at
            db.add(row)
        new_kid, pem, jwk, _ = _generate_rsa_keypair()
        db.add(SigningKey(
            kid=new_kid,
            status="active",
            algorithm="RS256",
            private_pem=_protect_private_pem(pem),
            public_jwk=jwk,
        ))
        replacement_kid = new_kid
    else:
        target.status = "retired"
        target.retire_after = now
        db.add(target)

    db.add(SecurityAuditEvent(
        actor_sub=actor_sub,
        action="signing_key.emergency_revoke",
        target_type="signing_key",
        target_id=kid,
        outcome="success",
        details={
            "previous_status": previous_status,
            "replacement_kid": replacement_kid,
            "revoked_at": now.isoformat(),
        },
    ))
    await db.commit()
    await invalidate_jwks_cache()
    logger.warning(
        f"Emergency signing-key revocation kid={kid} previous_status={previous_status} "
        f"replacement_kid={replacement_kid} actor_sub={actor_sub}"
    )
    return {"kid": kid, "status": "retired", "replacement_kid": replacement_kid}


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



async def ensure_fresh_signing_key(db: AsyncSession) -> None:
    """
    Auto-rotate when the active key is older than SIGNING_KEY_MAX_AGE_HOURS (default 7d).

    Called from JWKS and mint paths so rotation happens without a separate cron.
    Also prunes retiring keys past retire_after.
    """
    await prune_expired_retiring_keys(db)
    max_age_h = int(getattr(settings, "signing_key_max_age_hours", 168) or 168)
    overlap_h = int(getattr(settings, "signing_key_retire_overlap_hours", 24) or 24)
    if max_age_h <= 0:
        return

    result = await db.exec(
        select(SigningKey).where(
            SigningKey.status == "active",
            SigningKey.deleted_at.is_(None),
        )
    )
    first_fn = getattr(result, "first", None)
    row = first_fn() if callable(first_fn) else None
    # SQLAlchemy/SQLModel result is sync; AsyncMock tests may yield a coroutine
    if hasattr(row, "__await__"):
        row = await row  # type: ignore[misc]
    if row is None:
        return  # bootstrap happens on mint when exchange enabled

    created = getattr(row, "created_at", None)
    if created is not None and getattr(created, "tzinfo", "missing") is None:
        created = created.replace(tzinfo=timezone.utc)
    if not isinstance(created, datetime):
        return
    age = datetime.now(timezone.utc) - created
    if age >= timedelta(hours=max_age_h):
        logger.info(
            f"Active signing key kid={getattr(row, 'kid', '?')} age={age} >= max_age={max_age_h}h; rotating"
        )
        await rotate_signing_key(db, retire_after_hours=overlap_h)



async def ensure_signing_keys_ready(db: AsyncSession) -> SigningKey:
    """Ensure an active signing key exists while token exchange is enabled."""
    if not exchange_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Token exchange is not enabled",
        )
    await ensure_fresh_signing_key(db)
    row = (
        await db.exec(
            select(SigningKey).where(
                SigningKey.status == "active",
                SigningKey.deleted_at.is_(None),
            ).order_by(SigningKey.created_at, SigningKey.kid)
        )
    ).first()
    if row is not None:
        # Fail closed on malformed or unreadable stored private material.
        try:
            serialization.load_pem_private_key(
                _unprotect_private_pem(row.private_pem).encode("utf-8"), password=None
            )
        except HTTPException:
            raise
        except Exception as exc:  # noqa: BLE001
            logger.error("Stored signing key is invalid; refusing to use it")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Stored signing key is invalid",
            ) from exc
        return row
    return await bootstrap_signing_key(db)


async def bootstrap_signing_key(db: AsyncSession) -> SigningKey:
    """Create the first active key under a PostgreSQL transaction advisory lock."""
    # All bootstrap callers serialize on the same transaction lock, then recheck
    # the durable source of truth to avoid duplicate active rows under concurrency.
    await db.exec(text("SELECT pg_advisory_xact_lock(732104219)"))
    existing = (
        await db.exec(
            select(SigningKey).where(
                SigningKey.status == "active",
                SigningKey.deleted_at.is_(None),
            ).order_by(SigningKey.created_at, SigningKey.kid)
        )
    ).first()
    if existing is not None:
        return existing

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
        private_pem=_protect_private_pem(pem),
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
    Auto-rotates when active key exceeds SIGNING_KEY_MAX_AGE_HOURS.
    """
    await ensure_fresh_signing_key(db)
    stmt = select(SigningKey).where(
        SigningKey.status == "active",
        SigningKey.deleted_at.is_(None),
    ).order_by(SigningKey.created_at, SigningKey.kid)
    row = (await db.exec(stmt)).first()
    if row is None:
        row = await ensure_signing_keys_ready(db)

    try:
        private_key = serialization.load_pem_private_key(
            _unprotect_private_pem(row.private_pem).encode("utf-8"), password=None
        )
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.error("Stored signing key is invalid; refusing to sign")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stored signing key is invalid",
        ) from exc
    await redis_set(ACTIVE_KID_CACHE_KEY, row.kid, int(getattr(settings, "jwks_redis_ttl_sec", 120)))
    return private_key, row.kid


def _sanitize_public_jwks(raw_keys: list[Any]) -> list[dict[str, Any]]:
    """Keep only valid public RS256 RSA JWK fields and deduplicate by kid."""
    public_keys: dict[str, dict[str, Any]] = {}
    allowed_fields = {"kty", "use", "alg", "kid", "n", "e"}
    for raw in raw_keys:
        if not isinstance(raw, dict):
            continue
        if raw.get("kty") != "RSA" or raw.get("alg") != "RS256":
            continue
        if raw.get("use") not in (None, "sig"):
            continue
        kid, modulus, exponent = raw.get("kid"), raw.get("n"), raw.get("e")
        if not all(isinstance(value, str) and value.strip() for value in (kid, modulus, exponent)):
            continue
        if kid in public_keys:
            continue
        public_keys[kid] = {key: value for key, value in raw.items() if key in allowed_fields}
        public_keys[kid].setdefault("use", "sig")
    return list(public_keys.values())


async def build_jwks_document(db: AsyncSession) -> dict[str, Any]:
    """JWKS for active + retiring keys (not retired). Auto-rotates by max age."""
    if exchange_enabled():
        await ensure_fresh_signing_key(db)
    cached = await redis_get(JWKS_CACHE_KEY)
    if cached:
        try:
            cached_document = json.loads(cached)
            if isinstance(cached_document, dict) and isinstance(cached_document.get("keys"), list):
                safe_document = {"keys": _sanitize_public_jwks(cached_document["keys"])}
                if safe_document["keys"]:
                    if safe_document != cached_document:
                        await redis_set(
                            JWKS_CACHE_KEY,
                            json.dumps(safe_document),
                            int(getattr(settings, "jwks_redis_ttl_sec", 120)),
                        )
                    return safe_document
        except (json.JSONDecodeError, TypeError):
            pass

    stmt = select(SigningKey).where(
        SigningKey.status.in_(["active", "retiring"]),
        SigningKey.deleted_at.is_(None),
    )
    rows = list(await db.exec(stmt))
    keys = []
    now = datetime.now(timezone.utc)
    for row in rows:
        if row.status not in ("active", "retiring"):
            continue
        if row.status == "retiring" and row.retire_after is not None and row.retire_after <= now:
            continue  # treat as retired for JWKS until prune job runs
        jwk = _sanitize_public_jwks([row.public_jwk or {}])
        if jwk:
            keys.extend(jwk)

    # Do not create durable signing state from a public JWKS read. Bootstrap is
    # exchange-driven and remains impossible while the feature flag is disabled.
    if not keys and exchange_enabled():
        await ensure_signing_keys_ready(db)
        rows = list(await db.exec(stmt))
        for row in rows:
            if row.status not in ("active", "retiring"):
                continue
            if row.status == "retiring" and row.retire_after is not None and row.retire_after <= now:
                continue
            jwk = _sanitize_public_jwks([row.public_jwk or {}])
            if jwk:
                keys.extend(jwk)

    # Opt-in env PEM only (TAWALA_JWT_ALLOW_ENV_PEM=true)
    if not keys:
        env_key = _load_env_private_key()
        if env_key is not None:
            keys.append(public_jwk_from_private(env_key, "nethub-env-bootstrap"))

    doc = {"keys": _sanitize_public_jwks(keys)}
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
        "jti": uuid.uuid4().hex,
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

