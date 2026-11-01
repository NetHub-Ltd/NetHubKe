# NetHubKe Ecosystem Readiness Validation

**Purpose:** Evidence-based validation of the minimum NetHubKe capabilities required to serve Tawala, NetPay and future products.
**Baseline:** `dev` at branch creation on 2026-11-01.
**Validation branch:** `validation/ecosystem-readiness`
**Scope:** Inspect implementation, security boundaries, tests, migrations, configuration and CI evidence. No implementation changes, deployments, feature-flag changes or issue closures in this validation pass.

## Validation rules

- Judge only requirements necessary for the approved architecture contract.
- A requirement passes only when implementation and meaningful evidence support it; documentation or issue closure alone is insufficient.
- Mark unsupported claims **unverified**, not passed.
- Distinguish repository evidence from staging/runtime evidence.
- Nice-to-haves, UI polish, SDKs and speculative future features are not failures unless necessary to make the minimum integration contract safe and usable.
- Record exact file paths, relevant functions/routes, test names, CI run links and gaps.
- Keep all eight validation issues open until findings are reviewed with the user.

## Overall status

| Issue | Area | Status | Initial observation |
|---|---|---|---|
| #158 | Zitadel authentication boundary | Not yet validated | Inspect actual OIDC flow and token validation. |
| #159 | Canonical identity and lifecycle | Partially evidenced | AUTH_MATRIX describes issuer+subject mapping and lifecycle controls; verify code and tests. |
| #160 | Product registration and isolation | Not yet validated | Verify product model, audience binding and disabled-product enforcement. |
| #161 | Product-specific token issuance | Partially evidenced | AUTH_MATRIX describes exchange and N4/N5 behavior; verify implementation and negative tests. |
| #162 | JWKS and local verification contract | Partially evidenced | N5 merged; issuer-side behavior has CI evidence. Product verifier contract still needs precise validation. |
| #163 | Authorization and entitlements | Partially evidenced | N4 policy modes and PostgreSQL authority are documented; verify evaluator and tests. |
| #164 | Revocation, key rotation and freshness | **Known acceptance gap** | N5 CI passed, but the five-minute end-to-end stale-access bound is explicitly unproven without resource-server verifier evidence. |
| #165 | Product integration contract and operational prerequisites | Not yet validated | Compare routes, schemas, config, docs and startup/readiness behavior. |

## Confirmed programme context

- Architecture contract: `docs/SSO_ARCHITECTURE_CONTRACT.md`.
- Zitadel is the authentication provider; NetHubKe owns canonical identity, access policy and product-token issuance.
- Product APIs should verify NetHubKe JWTs locally using JWKS; no per-request introspection on hot paths.
- PostgreSQL is the durable source of truth; Redis is cache/coordination only.
- Product APIs retain their own business/resource permissions.
- Exchange remains default-off unless separately approved for rollout.
- PR #157 (N5) merged to `dev` as `17d38a3ca2ff1323c73577b30c591a28181bfd70`. Its reported CI passed on implementation head `801d925fec459fe8cc2c8095c2626d1415eb1fe9`; latest merge does not itself prove staging behavior.

## Findings

### #158 — Zitadel authentication boundary

**Status:** Not yet validated.

- Pending: trace OIDC discovery/configuration, authorization callback, state/nonce, token signature/issuer/audience/expiry validation and negative paths.
- Pending: confirm no local-password or alternate login path bypasses Zitadel.

### #159 — Canonical identity and lifecycle

**Status:** Partially evidenced; code-level validation pending.

- AUTH_MATRIX states canonical resolution uses exact validated `(issuer, sub)`, with email treated only as mutable profile data.
- AUTH_MATRIX states linking requires `identity:link`, admin/ops role and separately validated proof token; soft-deleted/disabled identities are excluded.
- Pending: verify models, database uniqueness, transactional provisioning, routes and corresponding tests on `dev`.

### #160 — Product registration and isolation

**Status:** Not yet validated.

- Pending: verify product identifiers, active-state enforcement, audience selection, product-specific organization mapping and caller inability to choose arbitrary product/audience.

### #161 — Product-specific token issuance

**Status:** Partially evidenced; code-level validation pending.

- AUTH_MATRIX states product tokens contain `jti`, use server-derived claims and supported claim profiles; exchange is default-off.
- N5 PR states product token lifetime is capped at 240 seconds.
- Pending: verify actual exchange route, claim construction, signing algorithm/type, audience binding, denial paths and tests.

### #162 — JWKS and local token verification contract

**Status:** Partially evidenced; verifier contract pending.

- N5 implementation rebuilds JWKS from PostgreSQL rather than trusting Redis response reads.
- N5 tests reportedly cover cache bypass and emergency revocation during Redis outage.
- Product verifier requirements documented as JWKS refresh <=60 seconds and clock leeway <=60 seconds.
- Pending: inspect actual JWKS route and public-key filtering; determine whether the documented verifier contract is sufficiently precise and testable. Do not infer product verifier compliance.

### #163 — Central authorization and entitlement decisions

**Status:** Partially evidenced; code-level validation pending.

- AUTH_MATRIX describes four explicit policy modes: `organization_only`, `individual_only`, `organization_or_individual`, `organization_and_individual`.
- It states inactive identity/product/service are hard denials; ProductLink is mapping, not entitlement; overrides are scoped, time-bounded and audited; PostgreSQL is authoritative.
- Pending: inspect evaluator, queries, authorization boundaries, audit persistence and decision-matrix tests.

### #164 — Revocation, signing-key rotation and access freshness

**Status:** **Known acceptance gap — end-to-end bound unproven.**

- N5 PR #157 merged to `dev`; reported CI: 218 tests, 74.93% coverage, per-file coverage and Alembic upgrade/downgrade/re-upgrade passed; Docker/PostgreSQL/Redis readiness passed.
- N5 issuer-side controls: token lifetime hard cap 240 seconds; JWKS is reconstructed from PostgreSQL; automatic rotation rechecks key age under advisory lock; emergency revocation and concurrency tests exist.
- Resource-server verifier cache refresh and clock behavior have not been measured against actual product verifiers. Therefore the five-minute end-to-end stale-access bound is **not proven**.
- Pending: inspect implementation/tests and identify the exact evidence needed for a valid end-to-end measurement.

### #165 — Product integration contract and operational prerequisites

**Status:** Not yet validated.

- Pending: inventory actual public exchange/JWKS endpoints, schemas, errors, required settings, issuer/audience/claims, flag behavior and startup dependencies.
- Pending: compare documented integration contract with mounted routes and runtime configuration.
- Pending: verify PostgreSQL is required at startup and Redis degradation is safe for the relevant flows.

## Change / evidence log

| Date | Area | Action / evidence | Result |
|---|---|---|---|
| 2026-11-01 | Programme | Read `AGENTS.md`, architecture contract, AUTH_MATRIX and trackers on `dev`. | Architecture boundaries and validation rules captured. |
| 2026-11-01 | Issues | Confirmed validation issues #158–#165 exist and are open. | No duplicate issues created. |
| 2026-11-01 | N5 | Checked PR #157 metadata and merge state. | Merged; end-to-end freshness remains unproven. |

## Final assessment

Not yet complete. The known blocker is the unproven five-minute end-to-end stale-access bound. All other areas remain subject to code-level inspection; partial documentation/CI evidence must not be promoted to a pass without verifying the underlying implementation and tests.
