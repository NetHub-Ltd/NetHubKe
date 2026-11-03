/** Same-origin policy for cookie-authenticated state-changing BFF requests. */
export function isSameOriginMutation(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    if (new URL(origin).origin !== new URL(request.url).origin) return false;
  } catch {
    return false;
  }

  const fetchSite = request.headers.get("sec-fetch-site");
  return !fetchSite || fetchSite === "same-origin";
}

export type ProvisionedAuthClaims = {
  accessToken?: unknown;
  backendSynced?: unknown;
  error?: unknown;
  user?: {
    id?: unknown;
    isActive?: unknown;
  } | null;
};

/** Pure authorization gate shared by the BFF and its regression tests. */
export function getProvisionedAuthContext(
  token: ProvisionedAuthClaims | null,
): { accessToken: string; userId: string } | null {
  const user = token?.user;
  if (
    !token ||
    !user ||
    token.error === "RefreshAccessTokenError" ||
    token.backendSynced !== true ||
    user.isActive !== true ||
    typeof user.id !== "string" ||
    typeof token.accessToken !== "string" ||
    !token.accessToken
  ) {
    return null;
  }
  return { accessToken: token.accessToken, userId: user.id };
}
