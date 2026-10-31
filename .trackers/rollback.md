# Rollback: consolidated N3–N5 implementation
- Historical branch/issue: `feat/n3-n5-token-policy-rotation` / #148 (PR #151 merged). Current follow-up: `fix/n3-n5-acceptance-completion` / #152; PR target `dev`.
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


## PR #151 acceptance-gap follow-up (#152)
- Branch: `fix/n3-n5-acceptance-gaps`; target `dev`.
- New migration `k4e5f6a7b8c9_add_user_identities.py` creates an empty identity map; it deliberately does not auto-link existing accounts by email. Existing email collisions fail closed until an explicitly authorized linking workflow is implemented.
- If migration/tests fail, keep exchange disabled and revert the follow-up PR as one unit. Do not backfill identity links from email or rewrite Git history.
- Standard claim profile emits no Tawala-specific organization/principal claims. Confirm resource servers accept that contract before enabling any non-Tawala exchange.


## PR #153 CI repair checkpoint — 2026-10-29 23:08 UTC
- Test-only follow-up commits added to `fix/n3-n5-acceptance-gaps` at head `efab03f2af994931aa04ae6e2d15f8d51b9f8d51f6`.
- If these tests expose a real application defect, fix the underlying behavior without weakening issuer+subject identity or database-authoritative entitlement checks.
- Backend CI #86 and readiness #47 were in progress; do not claim success until confirmed. PR remains draft/unmerged; exchange remains default-off.
- Existing rollback policy unchanged: no history rewrite, no deployment/flag changes, and no merge without explicit user approval.


## Authoritative checkpoint — 2026-10-31 10:54 UTC
- PR #153 was merged into dev before this follow-up; the current base is dev at 7feb7c5cb483fa29d25a9bbd39e11c7883bb14c7. Any earlier statements in this tracker saying PR #153 is draft/unmerged or that fix/n3-n5-acceptance-gaps is the active branch are historical and superseded.
- Approved delivery structure for issue #152: three coherent PRs, all targeting dev — PR 1 N3 canonical identity lifecycle; PR 2 N4 product access and entitlement policy; PR 3 N5 signing-key security and acceptance. No per-gap PRs. N4 policy approved: organization_only, individual_only, organization_or_individual, organization_and_individual; default organization_or_individual when both grant types are supported.
- Active branch: fix/n3-n5-acceptance-completion. It is 5 commits ahead of dev and 0 behind. Existing three identity-link commits are preserved; no history rewrite or force-push.
- PR 1: draft PR #154 https://github.com/NetHub-Ltd/NetHubKe/pull/154, targeting dev. Current head e47404f067a0e01c6330824460c7de0eccd0c1f1. It implements canonical issuer+subject lookup for authentication/profile routes, soft-delete filtering, verified email synchronization with collision checks, atomic new-user/identity persistence, disabled-user denial, dedicated identity:link scope plus admin/ops role, and async-safe proof-token validation. HTTP lifecycle and scope tests have been added.
- CI is running on PR #154 head: Backend CI run #41194563402 and Docker/Postgres/Redis readiness run #41194563444. Do not claim green until both finish and results are inspected. Local tests were not run because this runtime cannot resolve github.com; the available local archive is not the active branch.
- Existing migration k4e5f6a7b8c9_add_user_identities.py already creates the canonical mapping table; N3 has not introduced a duplicate table or email-based backfill. No new N3 migration is currently required.
- Issue #152 remains open. N3 acceptance is pending CI and review. N4 and N5 implementation have not started. Exchange remains default-off. No deployment changes and no merge without explicit user approval.
