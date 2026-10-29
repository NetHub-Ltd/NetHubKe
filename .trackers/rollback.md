# Rollback
- For implementation issue #144, revert its PR as one unit if regression or CI failures cannot be resolved.
- No database schema/migration, runtime configuration, feature-flag default, or deployment behavior is intentionally changed.
- Exchange remains disabled by default.
- Do not reset/rebase/force-push or rewrite shared Git history.
- Any later migration or runtime rollout needs a separate rollback plan and explicit approval.
