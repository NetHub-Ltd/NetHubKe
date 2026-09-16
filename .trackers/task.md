# Task — PR #61 Backend test foundation

## Goal
Green backend CI: pytest + coverage ≥70%, no zero-coverage app modules, GitGuardian clean.

## Approved scope
- Fix `app/crud/tenants.py` broken imports (TenantCreate/Update from schemas.schemas; Tenant from models.models)
- Expand unit/CRUD/API tests for low-coverage modules
- Clean intermediate commits that hardcoded CI DB passwords (GitGuardian)
- Keep PR target `dev`

## Completed
- [x] tenants.py import fix + rename UserCRUD → TenantCRUD
- [x] Expanded unit tests: helpers, security, tawala_token, redis_client, deps
- [x] Expanded CRUD tests: base, services/tenants
- [ ] Coverage ≥70% verified in CI
- [ ] GitGuardian green after history clean

## Active follow-ups
- Land N2 (#60) coordination if this branch still carries N2
- Further raise coverage on routes/tawala once CI baseline is green
- Stale PRs #33 / #38 triage

## Risks
- History rewrite requires force-push of feat/backend-test-foundation
- Integration tests need Postgres+Redis (provided by CI services)

## Verification
- `pytest tests/ --cov=app --cov-fail-under=70`
- `python scripts/check_coverage_files.py`
- GitGuardian check green
