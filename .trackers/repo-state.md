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


## Authoritative checkpoint — 2026-10-31 11:02 UTC
- PR #153 was merged into dev before this follow-up; the current base is dev at 7feb7c5cb483fa29d25a9bbd39e11c7883bb14c7. Earlier references in this tracker to PR #153 being draft/unmerged or fix/n3-n5-acceptance-gaps being active are historical and superseded.
- Approved delivery structure for issue #152: three coherent PRs, all targeting dev — PR 1 N3 canonical identity lifecycle; PR 2 N4 product access and entitlement policy; PR 3 N5 signing-key security and acceptance. No per-gap PRs. N4 policy approved: organization_only, individual_only, organization_or_individual, organization_and_individual; default organization_or_individual when both grant types are supported.
- Active branch: fix/n3-n5-acceptance-completion. Implementation commit 1f807c12e735bdc75c2d3821c741f03c8a7942a5 is 10 commits ahead of dev and 0 behind. Existing three identity-link commits are preserved; no history rewrite or force-push.
- PR 1: PR #154 https://github.com/NetHub-Ltd/NetHubKe/pull/154, targeting dev. It implements canonical issuer+subject lookup for authentication/profile routes, soft-delete filtering, verified email synchronization with collision checks, atomic new-user/identity persistence, disabled-user denial, dedicated identity:link scope plus admin/ops role, and async-safe proof-token validation. Opaque upstream subjects are preserved exactly. HTTP lifecycle and route-level linking tests cover success and denials.
- Validation on implementation commit 1f807c12e735bdc75c2d3821c741f03c8a7942a5: Backend CI run #98 passed — 185 tests passed, 74.04% coverage, per-file coverage check passed; Docker/Postgres/Redis readiness run #59 passed. Links: https://github.com/NetHub-Ltd/NetHubKe/actions/runs/41195037460 and https://github.com/NetHub-Ltd/NetHubKe/actions/runs/41195037483.
- Local test execution was unavailable because this runtime cannot resolve github.com; GitHub Actions ran against the current implementation commit.
- Existing migration k4e5f6a7b8c9_add_user_identities.py already creates the canonical mapping table; N3 introduced no duplicate table or email-based backfill. No new N3 migration was required.
- Issue #152 remains open. N3 is implemented and CI-verified, pending user review and merge approval. N4 and N5 implementation have not started. Exchange remains default-off. No deployment changes and no merge without explicit user approval.


## Stacked N3 follow-up — 2026-10-31
- Topic branch: `fix/n3-identity-transaction-followup`, created directly from PR #154 head `c9a0e5ef4c76d1f7712e3012a8f425f453db5be4`.
- This branch is intentionally stacked: its eventual PR base is `fix/n3-n5-acceptance-completion` (PR #154 source branch), not `dev`. Merging the topic PR folds the follow-up into the still-open #154; it does not merge #154 into `dev`.
- Follow-up scope: remove the independent tenant commit so tenant/user/identity persistence is one transaction; add PostgreSQL concurrent first-login coverage; add HTTP-level proof that email-only linking returns 409 without creating or mutating account/tenant/identity records.
- No N4/N5 scope, deployment changes, flag changes, or merge authorization is included.
- Validation is pending GitHub Actions on the stacked PR head; local execution is unavailable in this runtime.
