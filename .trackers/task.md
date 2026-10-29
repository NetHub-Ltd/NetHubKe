# Task: NetHubKe SSO architecture reconciliation (planning-only)
- Issue: #142 — docs: reconcile SSO architecture contract, Path A, and N0–N10 roadmap
- Umbrella: #57; conflicting Path A issue: #135
- Branch: docs/n0-sso-contract-reconciliation → PR to dev
- Approved target: Zitadel authenticates; NetHubKe owns canonical ecosystem identity/policy and issues short-lived product JWTs; product APIs validate NetHubKe JWKS locally.
- Approved policy: users + organizations/tenants; explicit grant evaluation; public availability separated from authentication; centralized admin; maximum five-minute stale-access window.
- Current work is documentation, issue reconciliation, and trackers only. No runtime/code/schema/flag/deployment changes.
- Before implementation: obtain separate user approval for the implementation issue/acceptance plan. Never merge without explicit approval.
