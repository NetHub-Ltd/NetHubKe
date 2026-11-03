# NetHubKe — Architecture A (Resource Server Only)

> **Status:** Direction reset. This branch intentionally contains **only this README**.  
> It documents the target architecture approved for realignment. Implementation will be rebuilt on top of this contract.

---

## Decision

**Architecture A is the only target.**

NetHubKe is an **IdP-agnostic resource server and identity-resolution API**.

It is **not** an Authorization Server that mints product tokens.

| Principle | Rule |
|-----------|------|
| **IdP-agnostic** | Switch identity providers (Zitadel, Auth0, Cognito, Keycloak, …) by **configuration only**. No platform rewrite. |
| **Backend role** | Receive a bearer token → validate it → resolve the local user → return **user info** (JSON). |
| **Not in scope** | Issuing a second (product) JWT. Product token exchange. NetHubKe JWKS for product APIs. |
| **Client model** | Website, Tawala, NetPay, and every future client use the **same** integration. |

---

## What clients do (one shared mechanism)

```text
[ Any OIDC IdP ]
        │  access token
        ▼
┌─────────────────────────────────────┐
│  NetHubKe Backend                   │
│  1. Validate JWT against configured │
│     IdP issuer + JWKS               │
│  2. Resolve canonical identity      │
│     (issuer + subject → local user) │
│  3. Return user / tenant /          │
│     entitlement data as JSON        │
│     — not a new token               │
└─────────────────────────────────────┘
     ▲            ▲            ▲
     │            │            │
  Website      Tawala       NetPay
  (same Bearer token, same API contracts)
```

1. User authenticates with the configured IdP.
2. Client obtains an **IdP access token**.
3. Client calls NetHubKe with `Authorization: Bearer <idp-access-token>`.
4. NetHubKe validates the token, resolves the user, returns profile and related data.
5. Client uses that **data**. NetHubKe does not mint a replacement token for the product.

There is no special path for Tawala, NetPay, or the website. All are API clients of NetHubKe.

---

## What Architecture A includes

### In scope

- **OIDC token validation** against a configurable issuer and JWKS (vendor-neutral).
- **Canonical identity mapping** keyed by `(issuer, subject)` — not by mutable email alone.
- **Local user and tenant** records owned by NetHubKe.
- **User sync / profile APIs** that return structured user info (e.g. sync on first call, read/update profile).
- **Shared entitlement / service-status reads** that any client can call with the same credential type.
- **Config-driven IdP switch**: change issuer, JWKS URL, audience expectations, and claim mapping without rebuilding apps.
- **Postgres** as durable source of truth for users, tenants, and business data NetHubKe owns.

### Explicitly out of scope

- Product token **exchange** (`/auth/exchange` and equivalents).
- NetHubKe as **issuer** of access tokens for product APIs.
- **Signing keys / JWKS** published for product resource servers to verify NetHubKe-minted JWTs.
- Per-product claim profiles used only for minting secondary tokens.
- Different integration mechanisms per product (every client uses the same pattern).
- Requiring product backends to trust NetHubKe JWKS instead of resolving identity via NetHubKe’s user-info APIs (or their own IdP validation, if they choose).

---

## Switching the IdP

To move from one provider to another:

1. Point configuration at the new issuer and JWKS (and audience / client settings as required).
2. Ensure access tokens still carry a stable `sub` and the claims NetHubKe needs (especially email or an equivalent stable identifier for display/sync policy).
3. Existing `(issuer, subject)` rows remain valid for the old issuer; new logins under the new issuer create or link identities according to explicit policy (no silent email-only takeover).

No rebuild of Tawala, NetPay, or the website integration model is required for a pure IdP swap under this contract.

---

## What this branch is for

This branch **deletes the previous tree on purpose** so the next implementation starts from a clear contract:

- No leftover exchange, signing-key, or product-JWT paths as the default design.
- README is the single source of truth for Architecture A until code is reintroduced under this model.
- `dev` and history remain intact; this is a topic branch for review and approval.

After this PR is approved, follow-up work will reintroduce backend and clients **only** in ways that implement Architecture A.

---

## Non-goals for the immediate rebuild

- Preserving product-token minting “just in case.”
- Hybrid modes where some products use exchange and others use user-info.
- Browser JavaScript calling NetHubKe with long-lived secrets (clients should use safe patterns appropriate to their stack; the **credential type** presented to NetHubKe remains the IdP access token or an equivalent server-side forward of it).

---

## Approval

Product owner direction: **Architecture A only.**

Next step after merge approval: plan the minimal resource-server surface (validate token → resolve user → return info) and shared client integration, then implement on a new feature branch from updated `dev`.


---

---

## Retained for Flux / GHCR (borrowed from prior `dev` as-is)

Flux (k3s-gitops) consumes images already published to:

```text
ghcr.io/nethub-ltd/nethubke:0.0.<n>
```

**Kept on this branch:**

| Path | Why |
|------|-----|
| `.github/workflows/build_and_push.yml` | CI definition that builds and pushes multi-arch images to GHCR (triggers: `master` / `main`, `v*` tags, `workflow_dispatch`) |

**Not retained (cleared as instructed):**

- `apps/backend/` — full application source and Docker context
- Frontend, other workflows, trackers, SSO docs, AGENTS, root package files

**Note:** Existing GHCR tags continue to serve the cluster. New image builds require a Docker context again; that will be reintroduced when Architecture A backend is implemented. Until then, `build_and_push.yml` documents the publish contract but will not produce a successful image without a restored `apps/backend/` build context.

