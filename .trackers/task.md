# Task: N1 exchange and JWT validation hardening
- Implementation issue: #144
- Programme umbrella: #57; architecture reconciliation PR: #143
- Branch: test/n1-exchange-regression-coverage → PR to dev
- Current milestone: N1. Follow N0 → N10; do not implement later milestones in this PR.
- Scope: exchange flag-off behavior, required upstream JWT claims, principal elevation prevention, product token claims/signature tests, JWKS response safety.
- Approved target: Zitadel authenticates; NetHubKe issues product-specific JWTs; products validate NetHubKe JWKS locally. Path A direct IdP bearer is not the ecosystem default.
- No schema/migration/deployment changes. Run backend CI and review its actual result before claiming tests pass.
- Do not merge without explicit user approval.
