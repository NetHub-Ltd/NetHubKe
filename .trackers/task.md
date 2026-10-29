# Task: Consolidated N3–N5 implementation (generic exchange, entitlements, key operations)
- Implementation issue: #148 — contract created 2026-10-29; maps to existing milestone issues #46–#50 without replacing their history.
- Programme umbrella: #57; approved architecture contract: `docs/SSO_ARCHITECTURE_CONTRACT.md`.
- Delivery plan: three PRs total — PR 1 N3–N5 (#148), PR 2 N6–N7 (#149), PR 3 N8–N10 (#150).
- Branch: `feat/n3-n5-token-policy-rotation` → PR target `dev`.
- N2 predecessor: issue #146 / PR #147 merged to `dev` at merge commit `31f61ded9a124009db8bdecf2c251d2628ade756` (2026-10-29). Exchange remains default-off; no live staging readiness is implied.
- Scope: audit and harden generic product exchange/claim profiles, product/org links and explicit entitlement precedence, signing-key rotation and emergency response. PostgreSQL is durable source of truth; Redis is disposable cache.
- Contract boundaries: no N6/N7 catalogue/launch work and no N8–N10 billing/settings work in this PR. Do not enable flags or change deployment.
- Tests-first; inspect current implementation and tests before edits. Do not infer acceptance from closed legacy issues.
- Workflow: topic branch; PR targets `dev`; update all four trackers at meaningful transitions; no merge without explicit user approval. Do not rebase, squash, reset, force-push, or rewrite history.

## Implementation progress (2026-10-29)
- Existing N3/N4/N5 code was audited before edits; the generic exchange route and product/link models already existed but acceptance gaps remained.
- Added unique `jti` to minted product JWTs; serialized key rotation with the PostgreSQL advisory lock; added an emergency key revocation path that replaces an active compromised key, immediately retires the target, invalidates Redis caches, and writes a durable audit event.
- Added PostgreSQL `security_audit_events` model/migration and durable audit for manual/automatic key rotation and emergency revocation.
- Entitlement policy now denies an explicitly inactive service regardless of subscription flag; org resolution no longer silently treats `tenant.id` as a product's external organization ID. User sync no longer silently reactivates disabled users.
- Added/updated tests for JWT jti, inactive service, missing explicit org link, disabled-user sync, key rotation audit and emergency revocation. CI not yet run; do not mark acceptance complete until the draft PR workflows and migration checks pass.

## CI checkpoint
- Draft PR #151: https://github.com/NetHub-Ltd/NetHubKe/pull/151
- Backend CI run #75 passed: https://github.com/NetHub-Ltd/NetHubKe/actions/runs/40957949078
- Docker/Postgres/Redis readiness run #36 passed: https://github.com/NetHub-Ltd/NetHubKe/actions/runs/40957949058
- Vercel check passed for the current draft head. These results validate current tested paths only; N3–N5 remains incomplete until canonical identity mapping, explicit grant precedence, generic claim-profile behavior, and comprehensive freshness/emergency tests are resolved.
