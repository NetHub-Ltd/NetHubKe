/**
 * IdP-agnostic OIDC settings for Auth.js and federated logout.
 * Prefer OIDC_*; KEYCLOAK_* remain aliases for existing deploys.
 */

export function oidcIssuer(): string {
  const v =
    process.env.OIDC_ISSUER?.trim() ||
    process.env.KEYCLOAK_ISSUER?.trim() ||
    "";
  if (!v) {
    throw new Error("OIDC_ISSUER or KEYCLOAK_ISSUER must be set");
  }
  return v.replace(/\/$/, "");
}

export function oidcClientId(): string {
  const v =
    process.env.OIDC_CLIENT_ID?.trim() ||
    process.env.KEYCLOAK_CLIENT_ID?.trim() ||
    "";
  if (!v) {
    throw new Error("OIDC_CLIENT_ID or KEYCLOAK_CLIENT_ID must be set");
  }
  return v;
}

export function oidcClientSecret(): string {
  return (
    process.env.OIDC_CLIENT_SECRET?.trim() ||
    process.env.KEYCLOAK_CLIENT_SECRET?.trim() ||
    ""
  );
}

type Discovery = {
  token_endpoint?: string;
  end_session_endpoint?: string;
  authorization_endpoint?: string;
  jwks_uri?: string;
};

let discoveryCache: { at: number; data: Discovery } | null = null;

/** OIDC discovery document (cached ~1h in-process). */
export async function oidcDiscovery(): Promise<Discovery> {
  const now = Date.now();
  if (discoveryCache && now - discoveryCache.at < 3600_000) {
    return discoveryCache.data;
  }
  const issuer = oidcIssuer();
  const url = `${issuer}/.well-known/openid-configuration`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`OIDC discovery failed: ${res.status} ${url}`);
  }
  const data = (await res.json()) as Discovery;
  discoveryCache = { at: now, data };
  return data;
}
