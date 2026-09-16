# Task — Signing key max-age 7d + no env PEM by default

## Goal
Backend generates RSA keys; auto-rotate after 7 days; dual JWKS during overlap; env PEM opt-in only.

## Completed
- [x] SIGNING_KEY_MAX_AGE_HOURS=168, RETIRE_OVERLAP=24, ALLOW_ENV_PEM=false
- [x] ensure_fresh_signing_key on mint + JWKS
- [x] Env PEM gated + non-PEM safe (from #67)
- [x] Docs + .env.example + tests
- [ ] CI green

## Verification
- pytest unit env key + max age
- JWKS does not 500 on hex env
