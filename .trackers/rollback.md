# Rollback

## Program docs (N0)
- Revert PR that added AGENTS.md / tracker lock if needed
- Board and milestones remain on GitHub (manual cleanup if required)

## Feature work (N1+)
- Feature flags default **off** — disable flag before revert if needed
- Prefer revert of topic-branch PR on `dev`
- Signing keys: do not delete active key until replacement published in JWKS
