import { NextResponse } from "next/server";
import { oidcDiscovery, oidcIssuer } from "@/lib/server/oidcConfig";

/**
 * Signup is owned by the IdP (register in Zitadel first, then NetHub syncs).
 * Redirect to the IdP authorization endpoint; users without an account use
 * the IdP's registration UI when enabled.
 */
export async function GET() {
  try {
    const discovery = await oidcDiscovery();
    const authz =
      discovery.authorization_endpoint ||
      `${oidcIssuer()}/oauth/v2/authorize`;
    return NextResponse.redirect(authz, 302);
  } catch (e) {
    console.error("Register redirect failed:", e);
    return NextResponse.json(
      { error: "IdP discovery unavailable" },
      { status: 503 },
    );
  }
}
