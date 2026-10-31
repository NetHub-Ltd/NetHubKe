# Task: Consolidated N3–N5 implementation (generic exchange, entitlements, key operations)
- Implementation issue: #148 — contract created 2026-10-29; maps to existing milestone issues #46–#50 without replacing their history.
- Programme umbrella: #57; approved architecture contract: `docs/SSO_ARCHITECTURE_CONTRACT.md`.
- Delivery plan for #152: three PRs total — PR 1 N3, PR 2 N4, PR 3 N5. N6–N7 (#149) and N8–N10 (#150) remain separate future work.
- Active branch for #152: `fix/n3-n5-acceptance-completion` → PR target `dev`.
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


## Follow-up to merged PR #151 — issue #152
- User confirmed PR #151 merged to `dev`; acceptance gaps were not closed by merge. Work continues on `fix/n3-n5-acceptance-gaps` before N6–N7 (#149) starts.
- Added `UserIdentity` with unique issuer+subject mapping and a PostgreSQL migration; validated token claims now carry issuer; sync creates identity mapping for new users and refuses email-only linking to an existing local account (409 requiring explicit linking); exchange looks up the canonical identity mapping.
- Added `standard` product claim profile support that omits Tawala-only `org_id` and `principal`, and fails closed on unsupported profiles. Tawala retains its compatibility profile.
- Removed trust in cached positive/negative entitlement decisions; PostgreSQL remains authoritative for each exchange decision, Redis writes are advisory only.
- Added regression tests for identity constraints, issuer+subject lookup, refusing email-only account linking, standard JWT claims, and unknown claim profiles.
- Important gaps still open: implement and test explicit organization/individual grant precedence and narrowly authorized admin override; provide a safe audited admin linking workflow for existing accounts; comprehensive emergency revocation/JWKS-cache behavior tests and measured end-to-end freshness bound. Do not start N6–N7 until those are closed and verified.
- CI not yet checked for this branch; local tests not run.


## CI repair checkpoint — 2026-10-29 23:08 UTC
- PR #153 latest head: `efab03f2af994931aa04ae6e2d15f8d51b9f8d51f6` (branch `fix/n3-n5-acceptance-gaps`).
- Corrected exchange fixtures to persist `UserIdentity` rows matching the exact token issuer and subject for success, inactive-user, no-tenant and entitlement-denied cases.
- Corrected CRUD expectations: repeated same issuer+subject is idempotent; same email with a different subject raises 409. Added explicit regression coverage.
- Corrected entitlement regression: stale Redis deny is ignored; database policy is recomputed and the advisory cache refreshed.
- Latest CI runs triggered on this head: backend CI #86 and readiness #47. Both were in progress at checkpoint; do not mark tests green until completed.
- Previous run #83: 7 failed / 164 passed, 72.93% coverage; readiness #44 passed. No merge authorized.


## CI result — 2026-10-29 23:09 UTC
- Backend CI run #86 PASSED: 172 tests passed, 73.38% coverage (70% threshold satisfied); per-file coverage check passed. https://github.com/NetHub-Ltd/NetHubKe/actions/runs/40970942410
- Docker/PostgreSQL/Redis readiness run #47 PASSED. https://github.com/NetHub-Ltd/NetHubKe/actions/runs/40970942458
- These runs checked code commit `efab03f2af994931aa04ae6e2d15f8d51b9f8d51f6`; later commits only append tracker documentation.
- Codecov upload reports `Repository not found` but is configured non-blocking; workflow remains successful.
- Green CI closes these test regressions only. Explicit grant precedence/admin override, safe audited account linking, emergency revocation/JWKS-cache tests, and measured end-to-end freshness remain open. PR #153 stays draft/unmerged; exchange remains default-off.


## Authoritative checkpoint — 2026-10-31 10:54 UTC
- PR #153 was merged into dev before this follow-up; the current base is dev at 7feb7c5cb483fa29d25a9bbd39e11c7883bb14c7. Any earlier statements in this tracker saying PR #153 is draft/unmerged or that fix/n3-n5-acceptance-gaps is the active branch are historical and superseded.
- Approved delivery structure for issue #152: three coherent PRs, all targeting dev — PR 1 N3 canonical identity lifecycle; PR 2 N4 product access and entitlement policy; PR 3 N5 signing-key security and acceptance. No per-gap PRs. N4 policy approved: organization_only, individual_only, organization_or_individual, organization_and_individual; default organization_or_individual when both grant types are supported.
- Active branch: fix/n3-n5-acceptance-completion. It is 5 commits ahead of dev and 0 behind. Existing three identity-link commits are preserved; no history rewrite or force-push.
- PR 1: draft PR #154 https://github.com/NetHub-Ltd/NetHubKe/pull/154, targeting dev. Current head e47404f067a0e01c6330824460c7de0eccd0c1f1. It implements canonical issuer+subject lookup for authentication/profile routes, soft-delete filtering, verified email synchronization with collision checks, atomic new-user/identity persistence, disabled-user denial, dedicated identity:link scope plus admin/ops role, and async-safe proof-token validation. HTTP lifecycle and scope tests have been added.
- CI is running on PR #154 head: Backend CI run #41194563402 and Docker/Postgres/Redis readiness run #41194563444. Do not claim green until both finish and results are inspected. Local tests were not run because this runtime cannot resolve github.com; the available local archive is not the active branch.
- Existing migration k4e5f6a7b8c9_add_user_identities.py already creates the canonical mapping table; N3 has not introduced a duplicate table or email-based backfill. No new N3 migration is currently required.
- Issue #152 remains open. N3 acceptance is pending CI and review. N4 and N5 implementation have not started. Exchange remains default-off. No deployment changes and no merge without explicit user approval.
