# Task — Startup DB/Redis hard-ready + signing key bootstrap

## Goal
Empty JWKS fixed by bootstrap on start and JWKS path; hard-stop if DB/Redis not ready.

## Root cause
Keys only bootstrapped on mint when exchange enabled; env PEM off → JWKS empty.

## Completed
- [x] ensure_redis_ready (PING)
- [x] lifespan: DB SELECT 1 + signing_keys, Redis PING, bootstrap key
- [x] ensure_signing_keys_ready + JWKS path bootstrap
- [x] GET /ready for k3s readinessProbe
- [x] unit tests
