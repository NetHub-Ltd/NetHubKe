/**
 * Product launch remains disabled until the one-time server-to-server
 * launch-code redemption flow is implemented. Never place product JWTs in
 * browser responses, URLs, fragments, storage, or client-side state.
 */
export function isLaunchHopEnabled(): boolean {
  return false;
}

/** No browser redirect target is exposed until secure launch redemption exists. */
export function productLaunchBaseUrl(_slug: string): string | null {
  return null;
}
