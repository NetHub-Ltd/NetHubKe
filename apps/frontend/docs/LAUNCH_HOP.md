# Product launch handoff

**Status: disabled.** The current browser token-fragment handoff is not an approved security boundary.

The previous flow returned a product JWT from a browser-facing BFF and placed it in the URL fragment. URL fragments are visible to page JavaScript and are not an acceptable place for bearer credentials. The exchange BFF therefore returns HTTP 410 and the Launch control remains unavailable, regardless of public environment flags.

## Required design before re-enabling

1. The authenticated website BFF asks NetHubKe to authorize the registered product.
2. NetHubKe creates a cryptographically random, short-lived, single-use launch code bound to the intended product, user and redirect audience.
3. The browser receives only that opaque code and redirects to a server-registered product callback. No product JWT, upstream token or credential is returned.
4. The product backend redeems the code directly with NetHubKe using its server-side machine identity.
5. Redemption atomically consumes the code and returns the short-lived product token only to the product backend.
6. Replays, expiry, wrong product, wrong audience, wrong client and invalid machine authentication fail closed.
7. Codes and tokens are never written to logs, analytics, referrers or browser storage.

The launch-code redemption contract, machine authentication and product-side callback must be implemented and tested before the feature can be enabled. This is separate from the website's OIDC login, profile and service-status integration.
