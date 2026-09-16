# Task — NetHubKe SSO Platform Program

## Mandatory
Every agent session: check Project board + report status (see AGENTS.md §2).

| Item | URL |
|------|-----|
| **Board** | https://github.com/orgs/NetHub-Ltd/projects/4 |
| **Umbrella** | https://github.com/NetHub-Ltd/NetHubKe/issues/57 |
| **Design PDF** | artifacts/NetHubKe_SSO_Platform_Audit_and_Dashboard_Redesign.pdf |

## Target
Keycloak = IdP · NetHubKe = multi-product token AS + console · products verify JWKS · Postgres only · Redis caches

## Milestones (order is mandatory)

| M | Focus | Issues (seed) |
|---|--------|----------------|
| N0 | Program lock, AGENTS, trackers | #40 #41 |
| N1 | Merge/harden Tawala exchange branch | #42 #43 |
| N2 | Managed signing keys + JWKS + Redis | #44 #45 |
| N3 | Generic multi-product exchange | #46 #47 |
| N4 | product_links + entitlements | #48 #49 |
| N5 | Key rotation | #50 |
| N6 | Console Home + My services | #51 #52 |
| N7 | Launch hop SSO | #53 |
| N8 | Billing console | #54 |
| N9 | Settings + profile polish | #55 |
| N10 | Operational readiness | #56 |

## Current
- **Active milestone:** N0 (this PR closes #40 #41)
- **Next:** N1 — merge `feat/tawala-token-exchange` (#42)

## Constraints
- Do not skip milestones
- Flags default off until acceptance met
- No SQLite; no staff/cashier rows in NetHub for Tawala floor users
- PRs to `dev`; cite N# + issue in PR body
