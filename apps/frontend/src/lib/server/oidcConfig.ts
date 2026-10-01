/**
 * IdP-agnostic OIDC settings for Auth.js and federated logout.
 * Prefer OIDC_*; KEYCLOAK_* remain aliases for existing deploys.
 *
 * Issuer/client must not throw at module load — Next.js collects page data
 * during `next build` and will import auth.ts without runtime secrets (Vercel).
 */

const BUILD_PLACEHOLDER_ISSUER = "https://build-placeholder.invalid";
const BUILD_PLACEHOLDER_CLIENT = "build-placeholder-client";

function readIssuer(): string {
  return (
    process.env.OIDC_ISSUER?.trim() ||
    process.env.KEYCLOAK_ISSUER?.trim() ||
    ""
  );
}

function readClientId(): string {
  return (
    process.env.OIDC_CLIENT_ID?.trim() ||
    process.env.KEYCLOAK_CLIENT_ID?.trim() ||
    ""
  );
}

/** True when real IdP env is present (not build placeholder). */
export function isOidcConfigured(): boolean {
  return Boolean(readIssuer() && readClientId());
}

export function oidcIssuer(): string {
  const v = readIssuer();
  if (v) return v.replace(/\/$/, "");
  return BUILD_PLACEHOLDER_ISSUER;
}

export function oidcClientId(): string {
  const v = readClientId();
  if (v) return v;
  return BUILD_PLACEHOLDER_CLIENT;
}

export function oidcClientSecret(): string {
  return (
    process.env.OIDC_CLIENT_SECRET?.trim() ||
    process.env.KEYCLOAK_CLIENT_SECRET?.trim() ||
    ""
  );
}

export function assertOidcConfigured(): void {
  if (!readIssuer()) {
    throw new Error("OIDC_ISSUER or KEYCLOAK_ISSUER must be set");
  }
  if (!readClientId()) {
    throw new Error("OIDC_CLIENT_ID or KEYCLOAK_CLIENT_ID must be set");
  }
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
  assertOidcConfigured();
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
