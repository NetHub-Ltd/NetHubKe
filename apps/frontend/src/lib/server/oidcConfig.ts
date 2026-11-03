import "server-only";
/**
 * Provider-neutral OIDC configuration for Auth.js and RP-initiated logout.
 * The configured issuer is the only provider-specific input; endpoints come
 * from its OIDC discovery document.
 *
 * Values must remain lazy because Next.js imports auth.ts during build without
 * production runtime secrets.
 */
const BUILD_PLACEHOLDER_ISSUER = "https://build-placeholder.invalid";
const BUILD_PLACEHOLDER_CLIENT = "build-placeholder-client";

function readIssuer(): string {
  return process.env.OIDC_ISSUER?.trim() || "";
}

function readClientId(): string {
  return process.env.OIDC_CLIENT_ID?.trim() || "";
}

export function isOidcConfigured(): boolean {
  return Boolean(readIssuer() && readClientId());
}

export function oidcIssuer(): string {
  const value = readIssuer();
  return value || BUILD_PLACEHOLDER_ISSUER;
}

export function oidcClientId(): string {
  return readClientId() || BUILD_PLACEHOLDER_CLIENT;
}

export function oidcClientSecret(): string {
  return process.env.OIDC_CLIENT_SECRET?.trim() || "";
}

export function assertOidcConfigured(): void {
  if (!readIssuer()) throw new Error("OIDC_ISSUER must be set");
  if (!readClientId()) throw new Error("OIDC_CLIENT_ID must be set");
}

export type OidcDiscovery = {
  issuer: string;
  authorization_endpoint?: string;
  token_endpoint?: string;
  userinfo_endpoint?: string;
  jwks_uri?: string;
  end_session_endpoint?: string;
};

let discoveryCache: { at: number; data: OidcDiscovery } | null = null;

/** Fetch and validate the configured issuer's standard OIDC discovery document. */
export async function oidcDiscovery(): Promise<OidcDiscovery> {
  assertOidcConfigured();

  const now = Date.now();
  if (discoveryCache && now - discoveryCache.at < 300_000) {
    return discoveryCache.data;
  }

  const issuer = oidcIssuer();
  const discoveryUrl = new URL(issuer.replace(/\/$/, "") + "/.well-known/openid-configuration");
  const response = await fetch(discoveryUrl, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) {
    throw new Error(`OIDC discovery failed with status ${response.status}`);
  }

  const data: unknown = await response.json();
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error("OIDC discovery returned an invalid document");
  }

  const metadata = data as Partial<OidcDiscovery>;
  if (
    typeof metadata.issuer !== "string" ||
    metadata.issuer !== issuer
  ) {
    throw new Error("OIDC discovery issuer does not match OIDC_ISSUER");
  }

  // Production deployments must not follow provider metadata to plaintext HTTP.
  if (process.env.NODE_ENV === "production") {
    if (new URL(issuer).protocol !== "https:") {
      throw new Error("OIDC_ISSUER must use HTTPS in production");
    }
    for (const endpoint of [
      metadata.authorization_endpoint,
      metadata.token_endpoint,
      metadata.userinfo_endpoint,
      metadata.jwks_uri,
      metadata.end_session_endpoint,
    ]) {
      if (!endpoint) continue;
      const parsed = new URL(endpoint);
      if (parsed.protocol !== "https:") {
        throw new Error("OIDC discovery contains a non-HTTPS endpoint");
      }
    }
  }

  discoveryCache = { at: now, data: metadata as OidcDiscovery };
  return discoveryCache.data;
}
