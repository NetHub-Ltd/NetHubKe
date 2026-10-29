# Rollback
- This branch is planning-only: documentation, tracker, and issue metadata/comment changes; no schema migration, application code, runtime configuration, or feature-flag changes.
- Preferred rollback: revert the planning PR as one unit. Do not reset/rebase/force-push or rewrite existing history.
- If issue descriptions/comments are updated outside the PR, revert those edits separately while preserving the original issue history.
- Before any later implementation PR, write a separate rollback plan for its concrete code/config/schema changes and migrations.
