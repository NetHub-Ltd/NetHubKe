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


## N5 implementation checkpoint — 2026-10-31

- User authorized implementation, testing and validation on one coherent PR targeting `dev`; no merge or deployment changes authorized.
- Topic branch: `fix/n5-signing-key-freshness`, created from `dev` at `6edd7844215c4703cd9d2c2d23433d63aa6e1b2b`.
- Implementing: automatic-rotation age recheck under the PostgreSQL advisory lock; PostgreSQL-authoritative JWKS responses; four-minute product-token lifetime hard cap; resource-server refresh and clock-skew requirements.
- Local test execution is unavailable because this runtime cannot resolve github.com. GitHub Actions validation is pending.
- Five-minute acceptance remains conditional on end-to-end tests against actual product resource-server verifiers; NetHubKe-side changes alone cannot prove their cache and clock behavior.


## N5 validation checkpoint — 2026-10-31

- Latest validated head: `82745f4ec772f08f4735741d5ac5e624a0fc0c35` on `fix/n5-signing-key-freshness` / PR #157.
- Backend CI run #121 passed: **218 tests passed**, **74.99% coverage**, per-file coverage validation passed, and Alembic upgrade → downgrade → upgrade passed. Run: https://github.com/NetHub-Ltd/NetHubKe/actions/runs/41221031075.
- Docker/PostgreSQL/Redis readiness run #82 passed. Run: https://github.com/NetHub-Ltd/NetHubKe/actions/runs/41221031072.
- PostgreSQL tests exercise independent-session concurrent manual rotation, concurrent automatic rotation, and emergency revocation while Redis invalidation is unavailable. HTTP tests verify operator-role and mutation-scope denials.
- No schema migration was needed for N5. No deployment or production feature-flag changes were made; exchange remains default-off.
- **N5 end-to-end freshness acceptance remains open:** the actual product resource-server verifiers are not in this repository, so their cached-JWKS refresh and clock-skew behavior have not been measured. The 240-second issuer cap and documented 60-second verifier limits are implementation controls, not proof of deployed verifier compliance.
- PR #157 remains open and unmerged pending user review. Do not close issue #152 or claim N5 fully accepted until the end-to-end verifier evidence is supplied.


## N5 validation refresh — 2026-11-01

- PR #157 latest implementation head validated: `801d925fec459fe8cc2c8095c2626d1415eb1fe9` (branch `fix/n5-signing-key-freshness`, target `dev`).
- Backend CI run #122 passed: **218 tests passed**, **74.93% coverage**, per-file coverage check passed, and PostgreSQL Alembic upgrade → downgrade → upgrade passed. https://github.com/NetHub-Ltd/NetHubKe/actions/runs/41221253077
- Docker/PostgreSQL/Redis readiness run #83 passed. https://github.com/NetHub-Ltd/NetHubKe/actions/runs/41221253135
- Vercel status check passed.
- Coverage and readiness are GitHub Actions evidence; tests were not run locally in this runtime.
- N5 repository implementation and CI validation are successful. The five-minute end-to-end stale-access bound remains **unproven** because deployed product resource-server verifier cache/clock behavior is outside this repository and has not been measured. Do not mark issue #152 fully accepted until that evidence exists.
- Exchange remains default-off. No deployment changes, production flag changes, merge, or issue closure were performed. PR #157 remains open for user review.


## Validation branch checkpoint — 2026-11-01
- `dev` base at branch creation: `17d38a3ca2ff1323c73577b30c591a28181bfd70` (N5 PR #157 merged).
- Validation-only branch: `validation/ecosystem-readiness`.
- Findings: `docs/ECOSYSTEM_READINESS_VALIDATION.md`.
- Eight validation issues #158–#165 are open. No issues closed; no code/schema/runtime/deployment changes.


## Backend minimum hardening — approved scope
- User-approved single backend PR: `fix/backend-minimum-hardening` targeting `dev`.
- Scope: bounded cached OIDC JWKS client; execute synchronous JWT/JWKS/UserInfo validation in a threadpool; preserve explicit HTTP authentication errors; five-minute JWKS refresh cap; Redis optional for startup/readiness with bounded socket timeouts and safe shutdown; deactivate (do not delete) legacy `tawala-platform`; retain existing entitlement administration unchanged.
- Explicit exclusions: frontend/Auth.js, product-role redesign, duplicate entitlement CRUD, new M2M mechanism, deployment/secret/feature-flag changes, and unrelated N3–N5 redesign.
- ZIP snapshots are read-only context. All repository inspection and writes for this task are performed through the GitHub connector.
- Validation must be reported from GitHub Actions; no local test execution or passing-test claim is assumed.


## Backend minimum hardening execution — PR #168
- PR: https://github.com/NetHub-Ltd/NetHubKe/pull/168; branch `fix/backend-minimum-hardening`; target `dev`.
- Base: `066cf55ef38a3a6a134af58f7fc0cc9ae4d65d4d`; implementation head at this checkpoint: `9df66d52617fc4124eeee332b5e7577aefe389dc`.
- GitHub compare confirms the topic branch is 5 commits ahead of `dev`, 0 behind; 15 files changed. No merge or deployment performed.
- Backend CI run #141 and Docker/PostgreSQL/Redis readiness run #102 are in progress. Results are not yet known; do not mark validation complete until both finish.
- Migration CI seeds an active legacy `tawala-platform` row at revision `m6g7h8i9j0k1`, upgrades through the deactivation migration, checks inactive state, downgrades one revision and checks the row remains inactive, then upgrades head again.


## Backend minimum hardening — validation result
- PR #168 remains open against `dev`; no merge or deployment has been performed.
- Implementation/workflow validation commit: `dceb056be6cb8ed8cc3697f0020d574715b107c3` (base `066cf55ef38a3a6a134af58f7fc0cc9ae4d65d4d`). Subsequent commits, if any, are tracker-only.
- Backend CI run #145 passed: **227 tests passed**, **76.83% total coverage**, required 70% threshold passed, and per-file coverage check passed. PostgreSQL migration validation passed: upgrade to parent revision, apply deactivation migration to the migration-seeded legacy row, verify inactive state, downgrade one revision, verify it remains inactive, and upgrade head again.
- Docker/PostgreSQL/Redis readiness run #106 passed. Vercel status passed.
- Codecov's upload endpoint returned `Repository not found`; the workflow is configured with `fail_ci_if_error: false`, and the GitHub Actions job passed with the coverage artifact generated.
- Tests were run by GitHub Actions only; no local test execution is claimed.


## Client integration contract draft — 2026-11-02
- Topic branch: `docs/client-bff-integration-contract`, based on `dev`.
- Added `docs/CLIENT_INTEGRATION_CONTRACT.md` as a documentation-only draft. It establishes the website as the reference browser client and makes the Next.js BFF the only browser-to-NetHubKe path.
- Browser code must call same-origin BFF routes only. NetHubKe origin, upstream/product bearer tokens, refresh tokens, client secrets and signing keys must not be exposed to browser JavaScript or public runtime configuration.
- The same policy applies to every browser-based product; each uses its own trusted BFF. Backend/machine clients remain server-to-server, and product APIs validate NetHubKe JWTs locally via JWKS.
- No application code, schema, feature flag, secret, or deployment setting changed. This documentation work is parallel planning only; it does not skip N0–N10. N1 (#42–#43) remains the earliest milestone whose acceptance evidence is not demonstrably complete per the architecture contract.
- Draft requires review on session storage, NetHubKe audience/scopes, first-login failure semantics, one-time launch-code handoff, and non-browser client transport.

## N1 acceptance validation and shared product-token configuration — 2026-11-03
- N1 validation baseline: PR #145 is merged; historical backend/readiness CI passed. PR #168 later passed 227 backend tests at 76.83% coverage. N1 issue #42/#43 remain closed with unchecked historical acceptance boxes; evidence is mapped in `docs/validation/N1_ACCEPTANCE_VALIDATION.md`.
- Investigation found `TAWALA_EXCHANGE_ENABLED` was a global product-token exchange kill switch, despite its Tawala-specific name. Other Tawala-prefixed settings configured shared issuer, TTL, PEM fallback, and a product audience override; `TAWALA_EXCHANGE_REQUIRE_SUBSCRIPTION` was unused.
- Branch `fix/shared-product-token-configuration` replaces shared settings with `PRODUCT_TOKEN_*`, removes the audience override in favor of `Product.audience`, removes the unused subscription setting, updates docs/env example/root README and adds N1 validation report.
- Exchange remains globally default-off. No deployment settings, secrets, database schema, production behavior, merge or rollout were changed. Fresh branch CI is pending.
- Additional Tawala-specific defaults removed: new Product rows and generic token-mint calls now default to the common `standard` claim profile; the Tawala profile is selected explicitly for Tawala. Generic signing/JWKS service and tests renamed to `product_tokens.py` / `test_product_tokens.py`.
- CI first attempt #165 failed at pytest collection because six test modules still imported the renamed `tawala_token` module. Updated all six imports to `product_tokens`; fresh backend CI #168 and readiness #129 are running. The initial 42.17% coverage is invalid because collection stopped before tests executed.
- Final verification: backend CI #175 (run `41608428220`) passed 228 tests, 76.85% coverage, per-file coverage, and Alembic upgrade/downgrade; readiness #136 (`41608427606`) passed `/health` and `/ready`; Vercel preview is successful. Codecov reports Repository not found but is non-blocking; coverage artifact uploaded.
- Removed `NEXT_PUBLIC_API_URL` from the frontend env example to align with BFF-only browser transport. The generated OpenAPI client still has a hardcoded localhost base URL; its import/use graph is not verified and it is not an approved browser transport. BFF integration remains a separate follow-up.
- PR #170 remains open against `dev` and is not merged. Backend CI #175 and readiness #136 passed; the Vercel preview for the latest docs/environment-template commit is still pending. N1 issue #42/#43 checklists remain unchanged and are not marked accepted by this PR.
