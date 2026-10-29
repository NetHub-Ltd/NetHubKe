"""Ops endpoints for signing-key rotation (N5)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlmodel import select

from app.api.deps import SessionDep, require_scopes
from app.db.schemas.schemas import TokenData
from app.db.models.models import User, UserIdentity, SecurityAuditEvent
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
            detail="Admin or ops role required for key rotation",
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
    issuer: str = Field(min_length=1, max_length=512)
    subject: str = Field(min_length=1, max_length=512)
    user_id: str = Field(min_length=1, max_length=36)


@router.post("/identities/link")
async def ops_link_upstream_identity(
    body: LinkIdentityBody,
    db: SessionDep,
    token_data: TokenData = Depends(require_scopes(["user:write"])),
):
    """Explicitly link a validated upstream issuer+subject to a local account."""
    _require_admin(token_data)
    from uuid import UUID

    issuer = body.issuer.strip().rstrip("/")
    subject = body.subject.strip()
    try:
        user_id = UUID(body.user_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="user_id must be a UUID") from exc
    if not issuer or not subject:
        raise HTTPException(status_code=422, detail="issuer and subject must not be blank")

    user = (
        await db.exec(
            select(User).where(User.id == user_id, User.deleted_at.is_(None))
        )
    ).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Local user not found")

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
        details={"issuer": issuer, "subject": subject},
    ))
    await db.commit()
    return {"linked": True, "user_id": str(user_id), "already_linked": False}
