# Repository State
- Repository: NetHub-Ltd/NetHubKe
- Baseline: `dev`; N2 PR #147 merged to `dev` at `31f61ded9a124009db8bdecf2c251d2628ade756` (2026-10-29).
- Current branch: `feat/n3-n5-token-policy-rotation`, created from `dev`.
- Current implementation issue: #148 (N3–N5 consolidated first PR); future consolidated issues #149 (N6–N7), #150 (N8–N10).
- Existing milestone issues #46–#50 remain the source history for N3–N5; link acceptance evidence rather than replacing/closing them without proof.
- Relevant current code observed: `app/api/v1/routes/auth.py` already contains generic exchange + Tawala alias; `Product`, `ProductLink`, `Membership`, `SigningKey` models exist; `services/entitlements.py` and key rotation helpers need a full audit before changing behavior.
- Current risks to investigate: canonical identity still uses email lookup (explicitly marked compatibility behavior); audience/profile handling may be product-specific; org resolution fallback and entitlement precedence need verification; key rotation helpers exist but need operator authorization, cache-failure and emergency-response tests.
- Exchange feature flag remains default-off. Do not claim live Zitadel staging or the end-to-end five-minute stale-access bound without evidence.
- Changes made on branch: JWT `jti`; serialized key rotation; emergency key revocation with replacement for active key; durable `security_audit_events` model/migration; inactive-service denial; explicit product-org link requirement (no tenant UUID fallback); disabled-user sync no longer silently reactivates accounts; updated claim/rotation/AUTH_MATRIX docs and regression tests.
- Validation status: no tests run locally (runtime cannot clone GitHub repository/network unavailable). Draft PR CI and PostgreSQL migration checks are required before calling acceptance complete.
- Operating constraints: PR target `dev`; no merge without explicit user approval; no history rewriting.


## Post-PR #151 acceptance-gap branch
- Follow-up issue #152; branch `fix/n3-n5-acceptance-gaps` from merged `dev`.
- Canonical identity foundation: `user_identities` maps normalized issuer + immutable subject to local user UUID; no backfill or email-only auto-link is performed. New user sync creates a mapping; existing email collision fails closed and requires explicit linking. Exchange resolves identity by this mapping.
- Claim profiles: `standard` excludes Tawala-only organization/principal claims; unsupported profile fails closed.
- Entitlement cache: exchange decisions no longer trust Redis cached decisions; PostgreSQL is read as source of truth.
- Pending acceptance: grant precedence/admin override model; audited explicit linking for existing accounts; comprehensive emergency revocation + JWKS/Redis outage tests; five-minute freshness measured end-to-end. Keep exchange default-off.


## CI repair checkpoint — 2026-10-29 23:08 UTC
- Active branch is `fix/n3-n5-acceptance-gaps`, PR #153 targeting `dev`; head `efab03f2af994931aa04ae6e2d15f8d51b9f8d51f6`.
- Exchange fixtures now create matching issuer+subject `UserIdentity` mappings for the four DB-backed exchange outcomes.
- CRUD tests now assert stable identity idempotency and reject email collision with a different subject (409).
- Entitlement test now asserts PostgreSQL recomputation wins over stale Redis negative cache.
- Backend CI run #86 and Docker/Postgres/Redis readiness run #47 were in progress at last check. Earlier backend CI #83 had 7 failures / 164 passes, 72.93% coverage; readiness #44 passed.
- Keep PR draft/unmerged and exchange default-off. Remaining N3–N5 policy/linking/emergency-response acceptance gaps remain open.
