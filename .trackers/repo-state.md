# Repository State
- Repository: NetHub-Ltd/NetHubKe
- Baseline: `dev`; N2 PR #147 merged to `dev` at `31f61ded9a124009db8bdecf2c251d2628ade756` (2026-10-29).
- Historical branch: `feat/n3-n5-token-policy-rotation` (PR #151, merged).
- Current implementation issue: #152 (N3–N5 acceptance completion); approved delivery is PR 1 N3, PR 2 N4, PR 3 N5. #149/#150 remain future N6–N10 work.
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


## Authoritative checkpoint — 2026-10-31 10:54 UTC
- PR #153 was merged into dev before this follow-up; the current base is dev at 7feb7c5cb483fa29d25a9bbd39e11c7883bb14c7. Any earlier statements in this tracker saying PR #153 is draft/unmerged or that fix/n3-n5-acceptance-gaps is the active branch are historical and superseded.
- Approved delivery structure for issue #152: three coherent PRs, all targeting dev — PR 1 N3 canonical identity lifecycle; PR 2 N4 product access and entitlement policy; PR 3 N5 signing-key security and acceptance. No per-gap PRs. N4 policy approved: organization_only, individual_only, organization_or_individual, organization_and_individual; default organization_or_individual when both grant types are supported.
- Active branch: fix/n3-n5-acceptance-completion. It is 5 commits ahead of dev and 0 behind. Existing three identity-link commits are preserved; no history rewrite or force-push.
- PR 1: draft PR #154 https://github.com/NetHub-Ltd/NetHubKe/pull/154, targeting dev. Current head e47404f067a0e01c6330824460c7de0eccd0c1f1. It implements canonical issuer+subject lookup for authentication/profile routes, soft-delete filtering, verified email synchronization with collision checks, atomic new-user/identity persistence, disabled-user denial, dedicated identity:link scope plus admin/ops role, and async-safe proof-token validation. HTTP lifecycle and scope tests have been added.
- CI is running on PR #154 head: Backend CI run #41194563402 and Docker/Postgres/Redis readiness run #41194563444. Do not claim green until both finish and results are inspected. Local tests were not run because this runtime cannot resolve github.com; the available local archive is not the active branch.
- Existing migration k4e5f6a7b8c9_add_user_identities.py already creates the canonical mapping table; N3 has not introduced a duplicate table or email-based backfill. No new N3 migration is currently required.
- Issue #152 remains open. N3 acceptance is pending CI and review. N4 and N5 implementation have not started. Exchange remains default-off. No deployment changes and no merge without explicit user approval.
