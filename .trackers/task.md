# Task — BFF only: no client-exposed FastAPI URL

## Goal
All browser data/exchange calls go through /api/nethub/*; BACKEND_URL server-only.

## Completed
- [x] GET /api/nethub/services/my-status
- [x] POST /api/nethub/auth/exchange
- [x] services page + launchHop use BFF
- [x] docs / env.example / axios deprecation
