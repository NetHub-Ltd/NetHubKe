# Rollback

- Previous known-good: tip of `dev` before `feat/dashboard-shell-profile`
- Revert or close the PR that introduces the dashboard shell
- Schema change is additive (`UserRead` extra fields); clients that ignore unknown fields remain compatible
- No migrations, no data changes, no infra changes
- Frontend-only rollback is sufficient if backend expansion is reverted together
