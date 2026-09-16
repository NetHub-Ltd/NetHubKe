# Rollback
- Revert commits on feat/backend-test-foundation or close PR #61
- `get_current_user` change: restore previous model_copy(sub=user.id) if needed (would re-break /me keycloak_id lookup)
- Phone helper: prior pattern rejected bare 254 prefix
- No migrations, no data changes
