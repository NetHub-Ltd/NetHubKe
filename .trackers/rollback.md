# Rollback: consolidated N3–N5 implementation
- Branch/issue: `feat/n3-n5-token-policy-rotation` / #148; PR target `dev`.
- Predecessor N2 PR #147 is merged. This branch must remain separate and reviewable.
- Keep all token exchange/issuer flags default-off; no deployment or runtime flag changes are authorized.
- If tests or review fail, revert this PR as one unit. Do not reset, rebase, squash, force-push, or rewrite history.
- Any schema migration must include tested PostgreSQL upgrade/downgrade behavior and an explicit data compatibility plan before review.
- PostgreSQL is authoritative for identity, products, links, entitlements and signing-key state. Redis is disposable cache; Redis failures must not become authorization grants or make durable state unrecoverable.
- Signing-key emergency response must preserve the key custody secret independently of the database; never log or expose private material. Keep the documented N2 backup/encryption process intact.
- If rollout behavior is uncertain, leave exchange disabled and revert the application change; do not claim five-minute revocation or staging readiness without evidence.
- No merge without explicit user approval.

## Consolidated PR 1 additions
- Migration `j3d4e5f6a7b8_add_security_audit_events.py` adds durable audit events; verify upgrade/downgrade on PostgreSQL before merge. If migration or audit writes fail, leave exchange disabled and revert the PR as a unit.
- Emergency revocation creates a replacement key when the targeted key is active, retires the compromised key immediately, commits a durable audit event and invalidates JWKS/active-kid caches. Validate these effects in CI before use.

## Validation checkpoint
- Draft PR #151 CI: backend run #75 passed; Docker/Postgres/Redis readiness run #36 passed; Vercel check passed.
- The new audit migration ran through the readiness workflow successfully, but explicit migration upgrade/downgrade assertions and the remaining identity/policy acceptance work still need review. Keep exchange disabled and PR in draft until all gates pass.
