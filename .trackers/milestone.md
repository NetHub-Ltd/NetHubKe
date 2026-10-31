# SSO Programme Milestone Tracker
**Umbrella:** #57  
**Architecture contract:** `docs/SSO_ARCHITECTURE_CONTRACT.md`  
**Last inspected:** 2026-10-31  
**Rule:** issue closure is not acceptance evidence; record CI/staging evidence separately.

## Delivery plan — three PRs
| PR group | Milestones | Tracking issue | Existing milestone issues | State |
|---|---|---|---|---|
| PR 1 | N3 canonical identity lifecycle | #152 | #46–#47 | PR #154 ready for review; backend CI and readiness green |
| PR 2 | N4 product access and entitlement policy | #152 | #48–#49 | Approved policy; implementation not started |
| PR 3 | N5 signing-key security and acceptance | #152 | #50 | Planned after PR 2 |

## Milestone status
| Milestone | Issues | Current state | Acceptance / next action |
|---|---|---|---|
| N0 | #40, #41; reconciliation #142 / PR #143 | User reports PR #143 merged to dev | Architecture baseline established; staging evidence remains distinct. |
| N1 | #42, #43; implementation #144 / PR #145 | User reports PR #145 merged to dev | Prior PR reports 152 tests passed, 75.22% coverage and readiness success; verify end-to-end compatibility as later changes land. |
| N2 | #44, #45; implementation #146 / PR #147 | PR #147 merged to dev at `31f61ded9a124009db8bdecf2c251d2628ade756` | Managed keys/JWKS baseline merged. Encryption rollout/staging and five-minute freshness are not proven by merge alone. |
| N3 | #46, #47 | #151 merged; #152 follow-up | Generic exchange now resolves by issuer+subject mapping; standard profile omits Tawala-only claims. Need explicit legacy account linking and CI verification; feature remains default-off. |
| N4 | #48, #49 | #152 follow-up | PostgreSQL is authoritative for each entitlement check; inactive services/missing required services fail closed. Explicit org/individual grant precedence and authorized admin override remain open. |
| N5 | #50 | #151 merged; #152 follow-up | Rotation/audit/emergency endpoint merged; comprehensive cache/JWKS emergency tests and measured end-to-end freshness remain open. |
| N6 | #51, #52 | Planned under #149 | Service catalogue and connected/trial/not-connected status. |
| N7 | #53 | Planned under #149 | Secure feature-flagged launch hop; redirect/token-leakage controls. |
| N8 | #54 | Planned under #150 | Read-only billing API/UI; NetHub remains source of truth. |
| N9 | #55 | Planned under #150 | Settings UI with real behavior and server-side authorization. |
| N10 | #56 | Planned under #150 | Operational runbook, staging soak, end-to-end acceptance and freshness bound. |

## N2 record
- User-approved implementation contract #146 was delivered in PR #147 and is now merged.
- Private-key custody uses Fernet encryption with external `SIGNING_KEY_ENCRYPTION_KEY`; production refuses missing/invalid key or legacy plaintext rows. Existing data still requires documented, backed-up conversion before production signing.
- Exchange remains default-off; no deployment/flag change or staging-readiness claim.
- PR merge does not itself establish live Zitadel staging readiness or the five-minute end-to-end stale-access guarantee.

## Remaining programme gaps
- Canonical identity must be keyed by `(issuer, immutable sub)`; email is not a stable identity key.
- Organization and individual grants require explicit, tested precedence.
- Five-minute maximum stale-access/revocation window must be demonstrated end-to-end.
- Live Zitadel staging verification and N10 operational readiness remain open.


## Current PR 1 implementation notes
- Branch `feat/n3-n5-token-policy-rotation`; issue #148.
- A PostgreSQL migration adds durable `security_audit_events` (down revision `i2c3d4e5f6a7`); verify this is the active migration head in CI before merge.
- Key remaining gaps to resolve before acceptance: canonical upstream identity mapping by (issuer, immutable sub); explicit org/individual grant precedence and a complete policy decision model; claim-profile behavior for non-Tawala products; comprehensive Redis failure, migration and end-to-end freshness tests.
- Backend CI #75, Docker/Postgres/Redis readiness #36, and Vercel check passed on draft PR #151. These checks do not close the remaining acceptance gaps. No flag enablement or merge is authorized.

## PR #151 post-merge gap follow-up
- Issue #152 / branch `fix/n3-n5-acceptance-gaps` addresses gaps explicitly acknowledged in PR #151.
- Identity mapping and standard claim profile work is implemented but not CI-verified yet.
- Do not start #149/N6–N7 until explicit grant precedence, safe existing-account linking, emergency-response tests and end-to-end freshness evidence are complete.


## PR #153 CI repair checkpoint — 2026-10-29 23:08 UTC
- Three test corrections committed to `fix/n3-n5-acceptance-gaps`: exchange tests add canonical identity mappings; CRUD tests enforce same-subject idempotency and cross-subject 409; entitlement test checks database-authoritative recomputation over stale Redis deny.
- New head `efab03f2af994931aa04ae6e2d15f8d51b9f8d51f6`; backend CI #86 and readiness #47 were in progress when recorded.
- Previous backend CI #83: 7 failed, 164 passed, 72.93% coverage. Previous readiness #44 passed. Await current run outcomes before assessing.
- N3–N5 remains incomplete: explicit grant precedence/admin override, safe audited account linking, comprehensive emergency revocation/JWKS-cache tests, and measured freshness evidence remain outstanding. Do not begin N6–N7.


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


## N4 acceptance validation — 2026-10-31
- PR #156 implementation commit 030a6b50502105e5b6d0653d2f6a9ce305ccd5c7 validated: 205 tests passed, 73.85% coverage, per-file coverage passed (Backend CI 41211623055).
- PostgreSQL migration upgrade/downgrade/re-upgrade passed. Docker/PostgreSQL/Redis readiness 41211623011 and Vercel passed.
- Subscription period timestamp conversion to timezone-aware UTC is covered by the migration workflow. Codecov Repository not found is non-blocking; artifact upload succeeded.
- PR #156 remains open, unmerged; N4 implementation and validation are complete pending user review. N5 remains separate.


## N5 implementation checkpoint — 2026-10-31

- User authorized implementation, testing and validation on one coherent PR targeting `dev`; no merge or deployment changes authorized.
- Topic branch: `fix/n5-signing-key-freshness`, created from `dev` at `6edd7844215c4703cd9d2c2d23433d63aa6e1b2b`.
- Implementing: automatic-rotation age recheck under the PostgreSQL advisory lock; PostgreSQL-authoritative JWKS responses; four-minute product-token lifetime hard cap; resource-server refresh and clock-skew requirements.
- Local test execution is unavailable because this runtime cannot resolve github.com. GitHub Actions validation is pending.
- Five-minute acceptance remains conditional on end-to-end tests against actual product resource-server verifiers; NetHubKe-side changes alone cannot prove their cache and clock behavior.
