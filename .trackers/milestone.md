# SSO Programme Milestone Tracker
**Umbrella:** #57  
**Architecture contract:** `docs/SSO_ARCHITECTURE_CONTRACT.md`  
**Last inspected:** 2026-10-29  
**Rule:** issue closure is not acceptance evidence; record CI/staging evidence separately.

## Delivery plan — three PRs
| PR group | Milestones | Tracking issue | Existing milestone issues | State |
|---|---|---|---|---|
| PR 1 | N3–N5 | #148 | #46–#50 | In progress on `feat/n3-n5-token-policy-rotation` |
| PR 2 | N6–N7 | #149 | #51–#53 | Planned; depends on PR 1 acceptance |
| PR 3 | N8–N10 | #150 | #54–#56 | Planned; depends on PRs 1 and 2 acceptance |

## Milestone status
| Milestone | Issues | Current state | Acceptance / next action |
|---|---|---|---|
| N0 | #40, #41; reconciliation #142 / PR #143 | User reports PR #143 merged to dev | Architecture baseline established; staging evidence remains distinct. |
| N1 | #42, #43; implementation #144 / PR #145 | User reports PR #145 merged to dev | Prior PR reports 152 tests passed, 75.22% coverage and readiness success; verify end-to-end compatibility as later changes land. |
| N2 | #44, #45; implementation #146 / PR #147 | PR #147 merged to dev at `31f61ded9a124009db8bdecf2c251d2628ade756` | Managed keys/JWKS baseline merged. Encryption rollout/staging and five-minute freshness are not proven by merge alone. |
| N3 | #46, #47 | In progress under #148 | Generic exchange route exists; JWT now adds jti and docs correct canonical subject claims. Stable upstream (issuer, sub) mapping remains unresolved; feature remains default-off. |
| N4 | #48, #49 | In progress under #148 | Inactive service denies and external org resolution fails closed without explicit link/approved Tawala mapping. Full grant-precedence model remains to audit/implement. |
| N5 | #50 | In progress under #148 | Rotation serialized; durable audit model + emergency key revocation implemented; CI/migration/test verification pending. |
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
- CI and staging evidence pending. No flag enablement or merge is authorized.