# NetHubKe — Engineering Agent Instructions

These instructions exist to preserve project continuity and deliver working software. They are not a substitute for the user's current task or approval.

## 1. Start from authoritative project state

Before repository work:
1. Read this file.
2. Read `.trackers/repo-state.md`, `.trackers/task.md`, and `.trackers/rollback.md`.
3. Read the relevant issue/PR and the exact implementation files named by the current task.

Do not repeat discovery already recorded in current trackers, accepted PRs or validation reports. Reopen a settled area only when a specific changed file, failing check or contradictory piece of evidence requires it. Record corrections when earlier reports become stale.

## 2. Product and architecture contract

NetHubKe is the identity, authorization and product-token control plane for NetHub products.

- **Upstream authentication:** NetHubKe integrates with a configured standards-compliant OIDC provider. The provider is replaceable; NetHubKe core must not depend on a named vendor, vendor endpoint path, SDK or proprietary claim schema.
- **Provider boundary:** use OIDC discovery for authorization, token, JWKS, UserInfo and logout endpoints. Provider-specific claim mapping belongs in configuration/adapter code. Core consumes normalized, validated issuer + immutable subject identity.
- **Canonical identity:** identity is keyed by exact normalized issuer + immutable subject. Email is mutable profile data, never the identity key. Account linking must be explicit and protected against email-only takeover.
- **NetHubKe:** owns canonical ecosystem identity, product/service registration, global access policy, user/organization grants, entitlement evaluation, centralized administration/audit and product-token issuance.
- **Product APIs:** validate short-lived, audience-specific NetHubKe JWTs locally through JWKS. They retain their business roles and resource permissions and do not call NetHubKe for per-request introspection on hot paths.
- **Browser clients:** browser JavaScript calls only same-origin BFF routes. Upstream tokens, product JWTs, machine credentials and signing keys remain server-side.
- **Persistence:** PostgreSQL is the durable source of truth. Redis is a disposable cache/coordination layer; cache failure must not turn a denial into an allow.
- **Freshness:** the five-minute stale-access target is end-to-end across token TTL, refresh, policy/cache propagation, verifier JWKS refresh and clock skew. Never claim it from issuer TTL alone.

## 3. Execution expectations

- Optimize for a working, reviewable outcome, not additional milestone lists or repeated approval gates.
- Execute the user's explicit task end-to-end: inspect relevant state, implement, run available checks, fix failures, update durable records and deliver a PR.
- Make ordinary engineering decisions within the approved architecture and scope without asking the user to approve each file or subtask.
- Ask only when a decision changes product behavior, security posture, production configuration, data migration/compatibility, cost, or another user-owned boundary.
- Do not create issues for bookkeeping. Create or update issues only for real implementation work or unresolved acceptance gaps, with exact scope and acceptance criteria.
- Close issues only when code and evidence satisfy them, or mark them superseded/not-planned with the replacement decision recorded.
- Distinguish implemented, tested, merged and production-verified. Never report one as another.

## 4. Repository workflow

- Work on a topic/domain branch; PRs target `dev`.
- Never commit directly to `dev`.
- Do not merge a PR or change production settings/secrets unless the user explicitly authorizes it.
- Prefer cohesive PRs that deliver a complete capability over one-issue-per-PR fragmentation.
- Do not force-push, rebase, reset or squash to work around review findings.
- Update all four `.trackers/` files for meaningful implementation state changes:
  - `task.md`: exact current task and next concrete action.
  - `repo-state.md`: verified branch/PR/code/test state.
  - `milestone.md`: programme mapping only where it materially helps delivery.
  - `rollback.md`: changed paths, migration/compatibility risks and rollback procedure.
- Keep README, architecture/client contracts and environment examples aligned with actual code.

## 5. Engineering defaults

- Backend: FastAPI, Python typing, SQLModel, PostgreSQL/asyncpg, Alembic, pytest, Loguru.
- Frontend: Next.js App Router, TypeScript, Tailwind CSS, Auth.js, TanStack Query, Zod and Lucide.
- Avoid TypeScript `any`; preserve strict typing.
- Keep provider-specific logic out of core; do not add a second password store.
- Validate all trust boundaries server-side. Never trust caller-supplied subject, audience, product identity, tenant, role, principal or entitlement.
- Add meaningful negative-path tests for security-sensitive changes.
- No secrets or private signing material in source control or browser bundles.
- PostgreSQL is required for durable state; do not substitute SQLite.

## 6. Delivery standard

A task is delivered when:
- The agreed behavior exists in code.
- Relevant tests, lint, type checks, migrations and production builds have been run where available.
- Failures are fixed or explicitly reported with evidence.
- Documentation and trackers match the implementation.
- A reviewable PR targeting `dev` is provided with changed files, decisions, validation results and remaining limitations.

A plan, issue, unchecked acceptance list or open PR is not itself a delivered outcome.
