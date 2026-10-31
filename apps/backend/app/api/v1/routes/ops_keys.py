"""Ops endpoints for signing-key rotation (N5)."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from hashlib import sha256
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlmodel import select
from starlette.concurrency import run_in_threadpool
from sqlalchemy.exc import IntegrityError

from app.api.deps import SessionDep, require_scopes
from app.core.config import settings
from app.core.security import _decode_token
from app.db.schemas.schemas import TokenData
from app.db.models.models import EntitlementOverride, Product, Tenant, User, UserIdentity, SecurityAuditEvent
from app.services.tawala_token import (
    rotate_signing_key,
    emergency_revoke_signing_key,
    prune_expired_retiring_keys,
    build_jwks_document,
)
from app.utils.logging import logger

router = APIRouter()


class RotateBody(BaseModel):
    retire_after_hours: int = Field(
        default=24,
        ge=1,
        le=720,
        description="Hours the previous key stays in JWKS as retiring",
    )


class RotateResponse(BaseModel):
    new_kid: str
    retiring_kids: list[str]
    retire_after: str


def _require_admin(token: TokenData) -> None:
    roles = {str(r).lower() for r in (token.roles or [])}
    if not (roles & {"admin", "super_admin", "ops"}):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or ops role required.",
        )


@router.post("/signing-keys/rotate", response_model=RotateResponse)
async def ops_rotate_signing_key(
    db: SessionDep,
    body: RotateBody | None = None,
    token_data: TokenData = Depends(require_scopes(["user:write"])),
):
    """
    Rotate AS signing key: new active key; previous active → retiring until retire_after.

    Requires admin/ops role. Purges Redis JWKS cache.
    """
    _require_admin(token_data)
    hours = body.retire_after_hours if body else 24
    result = await rotate_signing_key(db, retire_after_hours=hours, actor_sub=token_data.sub)
    logger.info(f"Ops key rotation by sub={token_data.sub} result={result}")
    return RotateResponse(**result)


@router.post("/signing-keys/prune")
async def ops_prune_retiring_keys(
    db: SessionDep,
    token_data: TokenData = Depends(require_scopes(["user:write"])),
):
    """Mark retiring keys past retire_after as retired; purge JWKS cache if needed."""
    _require_admin(token_data)
    n = await prune_expired_retiring_keys(db)
    return {"pruned": n}


@router.get("/signing-keys/jwks-preview")
async def ops_jwks_preview(
    db: SessionDep,
    token_data: TokenData = Depends(require_scopes(["user:read"])),
):
    """Admin visibility into current JWKS document (same as public /auth/jwks.json)."""
    _require_admin(token_data)
    return await build_jwks_document(db)


@router.post("/signing-keys/{kid}/emergency-revoke")
async def ops_emergency_revoke_signing_key(
    kid: str,
    db: SessionDep,
    token_data: TokenData = Depends(require_scopes(["user:write"])),
):
    """Immediately retire a compromised key; replacement is created if it was active."""
    _require_admin(token_data)
    return await emergency_revoke_signing_key(db, kid=kid, actor_sub=token_data.sub)


class LinkIdentityBody(BaseModel):
    proof_token: str = Field(min_length=1, max_length=16384)
    user_id: str = Field(min_length=1, max_length=36)


@router.post("/identities/link")
async def ops_link_upstream_identity(
    body: LinkIdentityBody,
    db: SessionDep,
    token_data: TokenData = Depends(require_scopes(["identity:link"])),
):
    """Link a local account only with a separately verified IdP identity proof."""
    _require_admin(token_data)
    from uuid import UUID

    try:
        user_id = UUID(body.user_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="user_id must be a UUID") from exc

    # The supplied proof is independently signature/issuer/audience/expiry checked
    # against the configured IdP. Never accept a caller-typed issuer or subject.
    proof = await run_in_threadpool(_decode_token, body.proof_token)
    issuer = (proof.issuer or "").strip().rstrip("/")
    # The upstream subject is opaque; preserve the exact validated claim.
    subject = proof.sub or ""
    if issuer != (settings.idp_issuer or "").strip().rstrip("/"):
        raise HTTPException(status_code=401, detail="Identity proof issuer is not trusted")
    if not subject or not proof.email or not proof.email_verified:
        raise HTTPException(status_code=403, detail="Verified upstream email is required for account linking")

    user = (
        await db.exec(
            select(User).where(User.id == user_id, User.deleted_at.is_(None))
        )
    ).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Local user not found")
    if (user.email or "").strip().lower() != str(proof.email).strip().lower():
        raise HTTPException(status_code=409, detail="Verified upstream email does not match the local account")

    existing = (
        await db.exec(
            select(UserIdentity).where(
                UserIdentity.issuer == issuer,
                UserIdentity.subject == subject,
                UserIdentity.deleted_at.is_(None),
            )
        )
    ).first()
    if existing is not None:
        if existing.user_id == user_id:
            return {"linked": True, "user_id": str(user_id), "already_linked": True}
        raise HTTPException(status_code=409, detail="Upstream identity is already linked to another account")

    user_issuer = (
        await db.exec(
            select(UserIdentity).where(
                UserIdentity.issuer == issuer,
                UserIdentity.user_id == user_id,
                UserIdentity.deleted_at.is_(None),
            )
        )
    ).first()
    if user_issuer is not None:
        raise HTTPException(status_code=409, detail="Local account already has an identity for this issuer")

    db.add(UserIdentity(issuer=issuer, subject=subject, user_id=user_id))
    db.add(SecurityAuditEvent(
        actor_sub=token_data.sub,
        action="identity.link",
        target_type="user",
        target_id=str(user_id),
        outcome="success",
        details={
            "issuer": issuer,
            "subject_sha256": sha256(subject.encode("utf-8")).hexdigest(),
            "proof_email_verified": True,
        },
    ))
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Identity link conflicts with an existing mapping") from exc
    return {"linked": True, "user_id": str(user_id), "already_linked": False}

class EntitlementOverrideCreate(BaseModel):
    product: str = Field(min_length=1, max_length=64)
    tenant_id: UUID | None = None
    user_id: UUID | None = None
    expires_at: datetime
    reason: str = Field(min_length=10, max_length=1000)

class EntitlementOverrideRead(BaseModel):
    id: UUID
    product: str
    tenant_id: UUID
    user_id: UUID | None
    expires_at: datetime
    reason: str

def _require_entitlement_admin(token: TokenData) -> None:
    roles = {str(role).lower() for role in (token.roles or [])}
    if not (roles & {"admin", "super_admin", "ops"}):
        raise HTTPException(status_code=403, detail="Admin or ops role required")

@router.post("/entitlements/overrides", response_model=EntitlementOverrideRead, status_code=201)
async def create_entitlement_override(
    body: EntitlementOverrideCreate,
    db: SessionDep,
    token_data: TokenData = Depends(require_scopes(["entitlements:override"])),
):
    """Create a narrow, expiring and audited entitlement grant."""
    _require_entitlement_admin(token_data)
    if (body.tenant_id is None) == (body.user_id is None):
        raise HTTPException(status_code=422, detail="Provide exactly one of tenant_id or user_id")
    now = datetime.now(timezone.utc)
    expires_at = body.expires_at
    if expires_at.tzinfo is None or expires_at.utcoffset() is None:
        raise HTTPException(status_code=422, detail="expires_at must include a timezone")
    if expires_at <= now or expires_at > now + timedelta(days=90):
        raise HTTPException(status_code=422, detail="expires_at must be in the next 90 days")
    product = (await db.exec(select(Product).where(
        Product.slug == body.product.strip().lower(), Product.deleted_at.is_(None)
    ))).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    if not product.is_active:
        raise HTTPException(status_code=409, detail="Cannot override an inactive product")
    target_user = None
    tenant_id = body.tenant_id
    if body.user_id is not None:
        target_user = (await db.exec(select(User).where(
            User.id == body.user_id, User.deleted_at.is_(None)
        ))).first()
        if target_user is None or not target_user.is_active or target_user.tenant_id is None:
            raise HTTPException(status_code=404, detail="Active tenant-linked user not found")
        tenant_id = target_user.tenant_id
    else:
        tenant = (await db.exec(select(Tenant).where(
            Tenant.id == tenant_id, Tenant.deleted_at.is_(None)
        ))).first()
        if tenant is None:
            raise HTTPException(status_code=404, detail="Tenant not found")
    override = EntitlementOverride(
        product_id=product.id, tenant_id=tenant_id,
        user_id=target_user.id if target_user else None,
        expires_at=expires_at, reason=body.reason.strip(), granted_by_sub=token_data.sub,
    )
    db.add(override)
    await db.flush()
    db.add(SecurityAuditEvent(
        actor_sub=token_data.sub, action="entitlement.override.created",
        target_type="entitlement_override", target_id=str(override.id), outcome="success",
        details={"product": product.slug, "tenant_id": str(tenant_id),
                 "user_id": str(target_user.id) if target_user else None,
                 "expires_at": expires_at.isoformat(), "reason": body.reason.strip()},
    ))
    await db.commit()
    await db.refresh(override)
    return EntitlementOverrideRead(
        id=override.id, product=product.slug, tenant_id=override.tenant_id,
        user_id=override.user_id, expires_at=override.expires_at, reason=override.reason,
    )

@router.post("/entitlements/overrides/{override_id}/revoke")
async def revoke_entitlement_override(
    override_id: UUID,
    db: SessionDep,
    token_data: TokenData = Depends(require_scopes(["entitlements:override"])),
):
    """Immediately revoke an override and durably audit the operator action."""
    _require_entitlement_admin(token_data)
    override = (await db.exec(select(EntitlementOverride).where(
        EntitlementOverride.id == override_id, EntitlementOverride.deleted_at.is_(None)
    ))).first()
    if override is None:
        raise HTTPException(status_code=404, detail="Entitlement override not found")
    if override.revoked_at is not None:
        return {"revoked": True, "already_revoked": True}
    override.revoked_at = datetime.now(timezone.utc)
    override.revoked_by_sub = token_data.sub
    db.add(override)
    db.add(SecurityAuditEvent(
        actor_sub=token_data.sub, action="entitlement.override.revoked",
        target_type="entitlement_override", target_id=str(override.id), outcome="success",
        details={"product_id": str(override.product_id), "tenant_id": str(override.tenant_id),
                 "user_id": str(override.user_id) if override.user_id else None},
    ))
    await db.commit()
    return {"revoked": True, "already_revoked": False}
