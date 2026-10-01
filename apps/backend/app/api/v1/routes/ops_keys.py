"""Ops endpoints for signing-key rotation (N5)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.api.deps import SessionDep, require_scopes
from app.db.schemas.schemas import TokenData
from app.services.tawala_token import rotate_signing_key, prune_expired_retiring_keys, build_jwks_document
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
    result = await rotate_signing_key(db, retire_after_hours=hours)
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
