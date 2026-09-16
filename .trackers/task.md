# Task — README badges + Codecov (default branch signal)

## Goal
Surface CI status, coverage, issues, and license on the README; upload backend coverage to Codecov so the badge updates after merges to `master` / runs on `dev`.

## Approved scope
- README badges (Backend CI, Frontend CI, Codecov, issues, PRs, license) pointed at `master`
- `codecov/codecov-action@v5` in `backend-ci.yml` (non-blocking without token)
- Docs: `apps/backend/docs/CODECOV.md` for `CODECOV_TOKEN` setup
- PR to `dev`

## Out of scope
- Frontend coverage (no jest/vitest gate yet)
- Changing coverage fail-under threshold
- N3+ SSO work

## Completed
- [x] README badges
- [x] Codecov upload step
- [x] CODECOV.md setup notes
- [ ] User adds `CODECOV_TOKEN` secret (manual)
- [ ] First successful upload after merge (badge turns numeric)

## Verification
- Workflow still runs pytest + ≥70% gate
- Codecov step does not fail CI if secret missing
