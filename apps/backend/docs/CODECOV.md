# Codecov setup (coverage badge)

Backend CI uploads `coverage.xml` to [Codecov](https://codecov.io) so the README coverage badge stays accurate on **`master`** (and `dev`).

## One-time setup

1. Sign in at https://app.codecov.io with the GitHub org that owns `NetHub-Ltd/NetHubKe`.
2. Add the repository (or enable the GitHub App for the org).
3. Copy the repo upload token.
4. In GitHub: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `CODECOV_TOKEN`
   - Value: the Codecov token

Until `CODECOV_TOKEN` is set, the Codecov step is non-blocking (`fail_ci_if_error: false`) and the coverage badge may show `unknown` until the first successful upload from `master` or `dev`.

## Local

```bash
cd apps/backend
pytest tests/ --cov=app --cov-report=xml:coverage.xml --cov-fail-under=70
# optional: codecov CLI upload if you have a token
```
