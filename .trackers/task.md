# Task — Fix JWKS 500 on malformed TAWALA_JWT_PRIVATE_KEY

## Goal
GET /api/v1/auth/jwks.json must not 500 when env private key is not PEM (e.g. hex secret).

## Root cause
_load_env_private_key called cryptography.load_pem_private_key on non-PEM values without guard.

## Fix
- Reject non-PEM (no BEGIN) and catch parse errors → None + warning log
- Negative unit + API tests (hex secret, garbage, malformed PEM)

## Verification
- pytest tests/unit/test_env_private_key.py
- pytest tests/api/test_auth_exchange.py::test_jwks_with_malformed_env_pem_still_200
