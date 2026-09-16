# Task — PR #61 Backend test foundation

## Goal
Green backend CI: pytest + coverage ≥70%, no zero-coverage app modules, GitGuardian clean.

## Approved scope
- Fix broken imports / test assertions that prevented a green ≥70% run
- Keep PR target `dev`
- No N3+ scope expansion

## Completed
- [x] tenants.py import fix
- [x] Expanded unit/CRUD/API tests
- [x] GitGuardian green (history cleaned of hardcoded CI passwords)
- [x] Coverage 78.52% (≥70%) — 79 passed
- [x] Fix phone helper: accept bare `254…` international form
- [x] Fix `test_decode_scope_list` to match TokenData OIDC noise filtering
- [x] Force test env issuer so CI KEYCLOAK_ISSUER_URL cannot drift from tokens
- [x] `get_current_user` keeps Keycloak `sub` (routes lookup by keycloak_id)
- [x] CI green on tip `148da71`

## Active follow-ups
- Coordinate N2 (#60) if still mixed into this branch
- Stale PRs #33 / #38 triage
- Further coverage on routes/tawala once this lands

## Risks
- `get_current_user` sub behaviour change is a correctness fix for /me lookups

## Verification
- CI run: https://github.com/NetHub-Ltd/NetHubKe/actions/runs/35097484270
- TOTAL coverage 78.52%, 79 passed, GitGuardian success
