"""Issue Tawala hard-session JWTs (ecosystem auth M2).

NetHubKe acts as AS: validates Keycloak access token, then mints a short-lived
RS256 token with aud=tawala-api for TawalaKE to verify via local JWKS.
"""
from __future__ import annotations

import base64
import json
import time
from typing import Any, Optional
from uuid import UUID

import jwt
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi import HTTPException, status

from app.core.config import settings
from app.utils.logging import logger


def exchange_enabled() -> bool:
    return bool(getattr(settings, "tawala_exchange_enabled", False))


def _load_private_key():
    pem = (getattr(settings, "tawala_jwt_private_key", None) or "").strip()
    if not pem:
        return None
    # Support escaped newlines from env
    pem = pem.replace("\\n", "\n")
    return serialization.load_pem_private_key(pem.encode("utf-8"), password=None)


def _public_jwk(private_key) -> dict[str, Any]:
    pub = private_key.public_key()
    numbers = pub.public_numbers()

    def _b64url_uint(val: int) -> str:
        length = (val.bit_length() + 7) // 8
        raw = val.to_bytes(length, byteorder="big")
        return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")

    return {
        "kty": "RSA",
        "use": "sig",
        "alg": "RS256",
        "kid": "nethub-tawala-1",
        "n": _b64url_uint(numbers.n),
        "e": _b64url_uint(numbers.e),
    }


def get_jwks() -> dict[str, Any]:
    """Public JWKS for Tawala AUTH_HARD_JWKS_URL."""
    key = _load_private_key()
    if key is None:
        return {"keys": []}
    return {"keys": [_public_jwk(key)]}


def mint_tawala_access_token(
    *,
    sub: str,
    org_id: UUID,
    principal: str,
    email: Optional[str] = None,
) -> tuple[str, int]:
    """
    Create RS256 access token for Tawala.

    Returns (token, expires_at_unix).
    """
    if not exchange_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Tawala token exchange is not enabled",
        )
    private_key = _load_private_key()
    if private_key is None:
        logger.error("tawala_exchange_enabled but tawala_jwt_private_key missing")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Tawala token signing is not configured",
        )
    if principal not in ("owner", "terminal"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="principal must be owner or terminal",
        )

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
        headers={"kid": "nethub-tawala-1"},
    )
    return token, exp
