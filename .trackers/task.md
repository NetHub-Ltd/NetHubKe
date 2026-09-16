# Task — PR #61 Backend test foundation

## Goal
Green backend CI: pytest + coverage ≥70%, no zero-coverage app modules, GitGuardian clean.

## Approved scope
- Fix broken imports / test assertions that prevented a green ≥70% run
- Keep PR target `dev`
- No N3+ scope expansion

## Completed
- [x] tenants.py import fix (earlier commits)
- [x] Expanded unit/CRUD/API tests (earlier commits)
- [x] GitGuardian green (history cleaned of hardcoded CI passwords)
- [x] Coverage already 77% on last CI run
- [x] Fix phone helper: accept bare `254…` international form
- [x] Fix `test_decode_scope_list` to match TokenData OIDC noise filtering
- [x] Force test env issuer so CI KEYCLOAK_ISSUER_URL cannot drift from tokens
- [x] `get_current_user` keeps Keycloak `sub` (routes look up by keycloak_id)
- [ ] CI green verification after this push

## Active follow-ups
- Coordinate N2 (#60) if still mixed into this branch
- Stale PRs #33 / #38 triage
- Further coverage on routes once baseline is green

## Risks
- `get_current_user` sub behaviour change is additive for correctness of /me lookups

## Verification
- `pytest tests/ --cov=app --cov-fail-under=70`
- GitGuardian check green
