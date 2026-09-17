/**
 * N7 launch hop: exchange via Next BFF, then redirect to product.
 * Feature-flagged via NEXT_PUBLIC_LAUNCH_HOP_ENABLED.
 * Never calls BACKEND_URL from the browser.
 */

export type ExchangeResponse = {
  access_token: string;
  token_type?: string;
  expires_at: number;
  org_id: string;
  principal: string;
  audience: string;
  product: string;
};

export function isLaunchHopEnabled(): boolean {
  const v = (process.env.NEXT_PUBLIC_LAUNCH_HOP_ENABLED || "").toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

/** Product app hard-session entry URL (no NetHub API URL). */
export function productLaunchBaseUrl(slug: string): string | null {
  if (slug === "tawala") {
    const u = process.env.NEXT_PUBLIC_TAWALA_LAUNCH_URL || "";
    return u.trim() || null;
  }
  return null;
}

/**
 * Build redirect URL. Token is placed in the hash fragment so intermediate
 * proxies/logs are less likely to capture it than query strings.
 */
export function buildProductRedirectUrl(
  baseUrl: string,
  exchange: ExchangeResponse
): string {
  const url = new URL(baseUrl);
  const frag = new URLSearchParams({
    access_token: exchange.access_token,
    token_type: exchange.token_type || "bearer",
    expires_at: String(exchange.expires_at),
    org_id: String(exchange.org_id),
    principal: exchange.principal,
    product: exchange.product,
  });
  url.hash = frag.toString();
  return url.toString();
}

/**
 * Exchange via same-origin BFF (session cookie / NextAuth on server).
 * Does not require the client to hold or send the Keycloak token explicitly
 * when the BFF reads the session — still accepts optional token for tests.
 */
export async function exchangeForProduct(
  product: string,
  _accessToken?: string,
  principal?: "owner" | "terminal"
): Promise<ExchangeResponse> {
  const res = await fetch("/api/nethub/auth/exchange", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      product,
      ...(principal ? { principal } : {}),
    }),
  });
  if (!res.ok) {
    let detail = `Exchange failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") detail = body.detail;
      else if (body?.detail) detail = JSON.stringify(body.detail);
    } catch {
      const t = await res.text().catch(() => "");
      if (t) detail = t.slice(0, 200);
    }
    throw new Error(detail);
  }
  return (await res.json()) as ExchangeResponse;
}
