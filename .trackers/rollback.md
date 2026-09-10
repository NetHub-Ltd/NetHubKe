# Rollback

- Previous known-good before this feature: commit before `b1e4462` / PR #35
- To roll back: revert merge commit `7d50c35` (or the feature commits) on `dev`
- Schema change is additive (`UserRead` extra fields); older clients remain compatible
- No migrations, no data changes, no infra / k3s changes
- Frontend + backend schema should be reverted together for consistency
