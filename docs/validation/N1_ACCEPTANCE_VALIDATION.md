# N1 Acceptance Validation

**Date:** 2026-11-03  
**Repository:** `NetHub-Ltd/NetHubKe`  
**Inspected baseline:** `dev` after PR #169 merge (`d2cdbd08ab9e10a3990a06766b73b49c5ddfdba4`)  
**Implementation branch:** `fix/shared-product-token-configuration`  
**Status:** N1 implementation and CI evidence exist; documentation/configuration reconciliation is being applied in this branch. Fresh CI for this branch is pending.

## 1. Scope and method

This validation maps N1 issue acceptance criteria (#42 and #43) to repository code, tests, CI and documentation. Closed issue status is not treated as acceptance evidence. Repository inspection and edits use GitHub repository operations; no local ZIP or local Git working copy is used.

Inspected sources include:

- `AGENTS.md`, `.trackers/repo-state.md`, `.trackers/task.md`, `.trackers/milestone.md`, `.trackers/rollback.md`
- `docs/SSO_ARCHITECTURE_CONTRACT.md`
- `docs/CLIENT_INTEGRATION_CONTRACT.md`
- `apps/backend/app/core/config.py`
- `apps/backend/app/api/v1/routes/auth.py`
- `apps/backend/app/services/product_tokens.py`
- `apps/backend/app/main.py`
- `apps/backend/app/db/models/models.py`
- `apps/backend/tests/api/test_auth_exchange.py`
- `apps/backend/tests/unit/test_product_tokens.py`
- `apps/backend/.env.example`
- `apps/backend/docs/AUTH_MATRIX.md`
- `apps/backend/docs/PRODUCT_CLAIM_PROFILES.md`
- `.github/workflows/backend-ci.yml`

## 2. N1 issue #42 — exchange implementation

Issue: https://github.com/NetHub-Ltd/NetHubKe/issues/42

| Acceptance item | Evidence | Assessment |
|---|---|---|
| PR merged to dev | PR #145 merged; current implementation is on dev | Verified |
| Exchange disabled by default | Settings default was false; exchange route checks the gate before database/key side effects | Verified on baseline; shared-name refactor retains false default |
| CI green | PR #145 backend and readiness workflows passed; later PR #168 CI passed 227 tests at 76.83% | Verified historical CI; fresh branch CI pending |
| AUTH_MATRIX documents exchange + JWKS | Baseline matrix mentioned the routes but did not explicitly document both exchange endpoints in a coherent current route/config matrix | Documentation gap; corrected in this branch |

### Implementation details verified on baseline

- `POST /api/v1/auth/exchange` accepts a product slug and uses server-resolved identity, product registry and entitlement policy.
- `GET /api/v1/auth/jwks.json` publishes public signing keys.
- Exchange is rejected with 503 before product/user lookup or signing side effects when disabled.
- Signing keys are PostgreSQL-authoritative; Redis is a disposable cache.
- Product JWTs are RS256 signed, short-lived, audience-bound and include a unique `jti`.
- Product APIs are expected to validate JWTs locally using JWKS rather than perform per-request introspection.

Historical CI evidence:
- PR #145 backend CI: https://github.com/NetHub-Ltd/NetHubKe/actions/runs/40889969712
- PR #145 readiness: https://github.com/NetHub-Ltd/NetHubKe/actions/runs/40889969702
- PR #168 backend CI: https://github.com/NetHub-Ltd/NetHubKe/actions/runs/41533459127 — 227 passed, 76.83% coverage, per-file coverage check passed.

## 3. N1 issue #43 — regression tests in CI

Issue: https://github.com/NetHub-Ltd/NetHubKe/issues/43

| Acceptance item | Evidence | Assessment |
|---|---|---|
| `test_tawala_token` successor runs in CI | `apps/backend/tests/unit/test_product_tokens.py` contains signing/JWKS helper tests; `apps/backend/tests/api/test_auth_exchange.py` contains exchange/JWKS route regressions; backend workflow runs `pytest tests/` | Verified historically; fresh branch CI pending |
| Flag-off path does not break existing auth tests | Route tests cover generic and legacy Tawala exchange disabled paths, no DB/key side effects, and CI runs the complete backend test directory | Verified historically; fresh branch CI pending |

The test suite contains explicit flag-off tests and success/denial paths for identity, entitlement, product audience and signing behavior. The shared configuration changes update the fixtures to use global setting names.

## 4. Tawala-named configuration investigation

### What the old flag did

`tawala_exchange_enabled` was misleadingly named. Its only purpose was a **global product-token exchange kill switch**:

1. It gated the generic `POST /auth/exchange` endpoint and the legacy Tawala alias.
2. It prevented signing-key initialization and token minting while disabled.
3. It gated automatic signing-key freshness/rotation and first-key bootstrap.
4. It did not independently configure or enable Tawala as a client; it applied to all products using the generic exchange service.

The code path was therefore platform-wide despite the Tawala prefix.

### Other Tawala-prefixed settings found in the inspected backend configuration/service

| Old setting | Actual behavior | Action in this branch |
|---|---|---|
| `TAWALA_EXCHANGE_ENABLED` | Global exchange gate, not per-product | Replaced with global `PRODUCT_TOKEN_EXCHANGE_ENABLED`, default false |
| `TAWALA_JWT_ISSUER` | Shared `iss` claim for all minted product JWTs | Replaced with `PRODUCT_TOKEN_ISSUER` |
| `TAWALA_JWT_TTL_SEC` | Shared token lifetime, hard-capped at 240 seconds | Replaced with `PRODUCT_TOKEN_TTL_SEC` |
| `TAWALA_JWT_PRIVATE_KEY` | Shared optional PEM bootstrap fallback | Replaced with `PRODUCT_TOKEN_PRIVATE_KEY` |
| `TAWALA_JWT_ALLOW_ENV_PEM` | Shared opt-in for PEM fallback | Replaced with `PRODUCT_TOKEN_ALLOW_ENV_PEM` |
| `TAWALA_JWT_AUDIENCE` | Product-specific environment override that could supersede the Product registry audience | Removed; `Product.audience` is now the sole source |
| `TAWALA_EXCHANGE_REQUIRE_SUBSCRIPTION` | Declared in Settings/example but not read by the exchange path; entitlement checks already run unconditionally | Removed as dead configuration |

Additional Tawala-specific defaults found outside environment configuration:
- The `Product.claim_profile` ORM default was `tawala`, which made new product rows inherit Tawala-only `org_id` / `principal` claims unless explicitly overridden. Its default is now `standard`.
- `mint_product_access_token` also defaulted to the Tawala claim profile. Its default is now `standard`; the Tawala profile is selected explicitly by the registered Tawala product row.
- The generic signing/JWKS implementation and its unit tests were named `tawala_token.py` / `test_tawala_token.py`. They are now `product_tokens.py` / `test_product_tokens.py`; all known runtime and test imports were updated.

Already-shared settings retained:
- `SIGNING_KEY_ENCRYPTION_KEY`
- `SIGNING_KEY_MAX_AGE_HOURS`
- `SIGNING_KEY_RETIRE_OVERLAP_HOURS`
- `JWKS_REDIS_TTL_SEC`

### Configuration model after this change

There is one shared product-token issuer integration:

- One global exchange gate.
- One issuer.
- One shared signing-key set and rotation policy.
- One token-lifetime policy.
- Product-specific audiences are read from the registered Product row in PostgreSQL.
- Entitlement policy and claim profile remain registered product metadata, not environment variables.

The global gate remains default-off because the existing N1–N5/staging rollout rules require fail-closed behavior. Removing the misleading Tawala-only name must not accidentally enable token issuance.

### Compatibility / rollout note

The new environment names are intentionally not aliases for the old `TAWALA_*` names. Existing deployment environments must be reviewed before any future exchange enablement. This PR does not modify deployment secrets or settings. With the new global setting absent, exchange remains disabled by default.

## 5. Documentation findings

- `apps/backend/docs/AUTH_MATRIX.md` had a route matrix that did not fully reconcile the current generic exchange/JWKS routes, global gate and claim-profile rules. Updated in this branch.
- `apps/backend/docs/PRODUCT_CLAIM_PROFILES.md` still described `TAWALA_JWT_AUDIENCE` as an environment override. Updated to state that `Product.audience` is authoritative.
- `docs/CLIENT_INTEGRATION_CONTRACT.md` now identifies the exchange gate as global and shared across products.
- Root `README.md` was a legacy Keycloak/old-pages scaffold with stale repository structure, endpoints, setup steps and a nonexistent root `.env.example` reference. Rewritten against the current repository architecture and actual backend/frontend example env files.
- Backend `.env.example` now uses shared `PRODUCT_TOKEN_*` names and the code's 300-second upstream JWKS TTL.

## 6. Known boundaries not proven by N1 evidence

- N5 five-minute stale-access acceptance remains an end-to-end requirement. NetHubKe's 240-second issuer cap and 300-second upstream JWKS cache setting do not prove deployed product verifier refresh/clock behavior.
- Secure N7 one-time launch-code redemption is not established by this N1 validation.
- Machine-client authentication and the full browser BFF runtime implementation are not accepted by this N1 report.
- The existing frontend example still contains `NEXT_PUBLIC_API_URL`; this validation did not remove it because its code usage has not yet been comprehensively verified. It must be reconciled with the BFF-only browser contract before frontend integration is declared conformant.
- The Tawala claim profile remains a product-registry profile for its existing `org_id`/principal compatibility contract. It is not an environment-level integration switch. Product-specific business permissions remain product-owned.

## 7. Branch changes and verification status

Changes made on `fix/shared-product-token-configuration`:

- Replaced Tawala-prefixed runtime environment settings with shared `PRODUCT_TOKEN_*` settings; renamed the generic issuer service/tests to `product_tokens.py` / `test_product_tokens.py`.
- Removed the per-product audience environment override; the Product registry supplies the audience.
- Removed the unused subscription requirement setting and changed new product/token claim-profile defaults from Tawala to `standard`.
- Updated backend unit/API tests and environment example.
- Updated the authentication matrix, product claim-profile documentation, client integration contract and root README.
- Added this validation report and updated repository trackers.

### CI execution record

- First branch run #165 (run ID `41607772576`) failed during pytest collection: six test modules still imported the old `app.services.tawala_token` path after the generic service rename. No test assertions ran; the reported 42.17% coverage was therefore a collection-failure artifact, not a meaningful coverage result.
- Corrected all six remaining imports in `test_signing_key_concurrency.py`, `test_env_private_key.py`, `test_key_rotation.py`, `test_n2_signing_key_acceptance.py`, `test_n3_identity_and_profiles.py` and `test_signing_key_max_age.py`.
- A fresh backend CI run #168 (run ID `41608000845`) and readiness run #129 (run ID `41608000835`) were started for the corrected branch. Their final results are pending.

**Still not verified:** successful fresh backend test/coverage run, readiness workflow completion, frontend lint/build, production environment compatibility and staging verifier behavior.

No database schema/migration, deployment secret, production setting, exchange enablement or merge has been changed.
