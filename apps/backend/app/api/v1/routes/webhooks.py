"""Payment provider webhooks — signature required, idempotent."""
from __future__ import annotations

import json

from fastapi import APIRouter, Header, HTTPException, Request

from app.api.deps import SessionDep
from app.crud import subscriptions as sub_crud
from app.db.schemas.schemas import PaymentEventRead

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/payments/{provider}", response_model=PaymentEventRead)
async def payment_webhook(
    provider: str,
    request: Request,
    session: SessionDep,
    x_nethub_signature: str | None = Header(default=None, alias="X-NetHub-Signature"),
) -> PaymentEventRead:
    body = await request.body()
    try:
        payload = json.loads(body.decode("utf-8") or "{}")
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Invalid JSON") from exc
    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="JSON object required")
    if not provider or len(provider) > 64:
        raise HTTPException(status_code=400, detail="Invalid provider")
    event = await sub_crud.process_payment_webhook(
        session,
        provider=provider.strip().lower(),
        body=body,
        signature_header=x_nethub_signature,
        payload=payload,
    )
    return PaymentEventRead.model_validate(event)
