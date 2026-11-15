# Task — RS readiness P0 implementation

## Status

- Workstream: Implement P0 gaps from Resource Server readiness audit (#227, #228, #229).
- Topic branch: `fix/rs-p0-audience-authz`
- Base branch: `dev`
- Pull-request target: `dev`
- Issues: #227 #228 #229

## Scope

1. **#227** Enforce resource audience validation (`RESOURCE_AUDIENCE`, production fail-closed).
2. **#228** Document IdP access-token profile (`docs/IDP_TOKEN_PROFILE.md`).
3. **#229** Route authorization inventory (`docs/AUTHZ_MATRIX.md`).

## Explicit non-goals

- Organization membership, subscription domain, audit event stream (P1/P2).
- Changing Architecture A boundary (still no product JWT minting).
- The audit branch `docs/rs-readiness-audit-2026-11` remains reference-only.

## Verification

- Unit tests extended in `apps/backend/tests/test_security.py` and `test_config.py`.
- Local pytest may be unavailable in agent environment; CI backend-ci is the gate.
