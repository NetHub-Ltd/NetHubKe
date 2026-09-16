# Task — N3 Generic multi-product token exchange

## Goal
POST /auth/exchange with product parameter + products registry; keep /exchange/tawala alias; document tawala claim profile.

## Milestone
**N3** — issues #46 #47

## Approved scope
- products table + migration (seed tawala)
- POST /api/v1/auth/exchange { "product": "..." }
- Alias POST /exchange/tawala
- Flag default off (TAWALA_EXCHANGE_ENABLED)
- Docs: PRODUCT_CLAIM_PROFILES.md
- Tests: disabled-by-default, generic body, unknown product

## Completed
- [x] Product model + migration e8f9a0b1c2d3
- [x] Generic exchange + alias
- [x] mint_product_access_token
- [x] Claim profile docs
- [x] API/unit tests
- [ ] CI green on PR

## Out of scope
- N4 product_links / entitlements
- N5 key rotation
- Frontend launch hop

## Risks
- Additive migration only
- Existing /exchange/tawala clients keep working
- Exchange remains disabled until configured

## Verification
- pytest auth exchange tests
- alembic upgrade head (products table)
