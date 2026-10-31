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


## N3 stacked follow-up review update — 2026-10-31
- Reviewed PR #155 against its actual test fixtures and model constraints. Found the concurrent PostgreSQL test used `test_engine` without the `db_session` fixture that creates the schema; corrected it to depend on `db_session` while retaining two independent sessions.
- Added a start barrier so both provisioning attempts begin together, exercising the tenant-email and identity uniqueness race rather than merely running two sequential calls.
- Confirmed `Tenant.email` and `User.email` are unique, and `UserIdentity` has unique (issuer, subject) and (user_id, issuer) constraints. The losing transaction is expected to roll back and re-read the winning identity.
- Confirmed the HTTP email-only-linking test uses the normal isolated client/database fixtures and asserts no identity, user, or tenant was created.
- Validation remains **not run**: the stacked PR base does not match the repository workflows' `pull_request.branches: [dev]` filter, no workflow run exists for this head, and this runtime cannot execute the repository's PostgreSQL test suite. No passing test/CI claim is made.
- No workflow changes, N4/N5 work, deployment changes, flag changes, or merges were made. PR #155 remains stacked on PR #154.


## Backend CI assertion repair — 2026-10-31
- Backend CI run 41205708540 on PR #154 head `0eb3f8bbb2ff596e8b60f0af15bc9793367146ef` failed only in the two new identity lifecycle tests; 185 tests passed.
- Both failures compared SQLAlchemy one-column count result rows (for example `(0,)`) directly to integers. Changed all six count assertions in `test_identity_lifecycle.py` to use `.scalar_one()`, which asserts the scalar count rather than the Row wrapper.
- PostgreSQL readiness passed. The concurrent provisioning test exercised the tenant-email uniqueness race; the loser transaction rolled back and resolved the winning identity. The observed failure was the test's Row/int assertion, not the uniqueness-race assertion.
- Re-run Backend CI on the updated PR #154 head before considering N3 validated. No production behavior, workflow configuration, deployment, feature flag, or merge state changed.


## Backend CI repair completed — 2026-10-31
- PR #155 was merged into this branch as merge commit `0eb3f8bbb2ff596e8b60f0af15bc9793367146ef`; its earlier notes that it remained open and validation was pending are superseded.
- Backend CI initially failed on this merged head with 185 passed / 2 failed. Both failures were test-only comparisons of SQLAlchemy one-column count rows to integers.
- Fixed all six count assertions in `apps/backend/tests/api/test_identity_lifecycle.py` to use `.scalar_one()` in commit `bfac7066e3f40a8b0afe7e23f46549f96e954b38`.
- Backend CI run #101 passed on that code: **187 tests passed, 74.19% coverage**, per-file coverage validation passed. https://github.com/NetHub-Ltd/NetHubKe/actions/runs/41207472219
- Docker/Postgres/Redis readiness run #62 passed. https://github.com/NetHub-Ltd/NetHubKe/actions/runs/41207472249
- Vercel check passed. Coverage XML was generated; the non-blocking Codecov upload returned `Repository not found`, while the GitHub Actions workflow completed successfully.
- No application runtime behavior, CI workflow configuration, deployment, feature flag, or merge state was changed by this repair. PR #154 remains open against `dev` for review; no merge is authorized.


## N4 final implementation PR
- Branch feat/n4-product-entitlement-policy targets dev from 858cf32e2e53649e3a78a9d632638ae269d54c47.
- Explicit Product policy modes: organization_only, individual_only, organization_or_individual (default), organization_and_individual.
- Organization grants are product-scoped active-period Subscriptions; individual grants reuse Membership. Legacy product_id-null subscriptions are preserved and do not grant access. ProductLink is mapping only.
- Time-bound overrides require entitlements:override and admin/super_admin/ops, reason, max 90-day expiry, and durable create/revoke audit. Overrides only satisfy their corresponding policy dimension.
- PostgreSQL is authoritative and Redis is not consulted for entitlement decisions. Migration, policy matrix, authorization, audit, and exchange tests are included. CI validation pending; exchange stays default-off and no deployment changes are included.


## N4 validation completed — 2026-10-31
- Final implementation commit 030a6b50502105e5b6d0653d2f6a9ce305ccd5c7 is on PR #156.
- Backend CI 41211623055: 205 tests passed, 73.85% coverage, per-file coverage check passed.
- PostgreSQL Alembic upgrade → downgrade one revision → upgrade head passed. Docker/PostgreSQL/Redis readiness 41211623011 passed; Vercel passed.
- Subscription period columns now use timezone-aware timestamps; existing naive values are interpreted as UTC by migration. Downgrade reverses that conversion.
- Codecov upload's Repository not found is non-blocking; coverage artifact was produced. PR #156 remains open and unmerged; exchange stays default-off.
