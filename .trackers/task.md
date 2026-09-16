# Task — N5 Signing key rotation

## Milestone
**N5** — #50

## Goal
Rotate creates new active key; previous retiring; JWKS dual publish until retire_after; ops endpoint; Redis purge.

## Completed
- [x] rotate_signing_key + prune_expired_retiring_keys
- [x] JWKS skips expired retiring
- [x] POST /ops/signing-keys/rotate|prune + jwks-preview
- [x] Docs SIGNING_KEY_ROTATION.md
- [x] Tests
- [ ] CI green

## Verification
- pytest unit + ops auth tests
