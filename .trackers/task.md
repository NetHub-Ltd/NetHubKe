# Task — N4 Product links & entitlements

## Milestone
**N4** — #48 #49

## Goal
product_links table; exchange org_id from link; owner can set link; entitlement Redis cache fail-closed when require_subscription.

## Completed
- [x] product_links model + migration f9a0b1c2d3e4
- [x] resolve_org_id + check_entitled (Redis)
- [x] PUT/GET /users/me/product-links (owner/admin)
- [x] Exchange uses entitlement + link org_id
- [x] Docs + unit tests
- [ ] CI green

## Out of scope
- N5 key rotation, N6 console IA, billing

## Verification
- pytest unit entitlements + auth exchange
- alembic upgrade head
