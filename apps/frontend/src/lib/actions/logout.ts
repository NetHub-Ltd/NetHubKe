"use server";

import { signOut, auth } from "@/auth";
import { oidcClientId, oidcDiscovery, oidcIssuer } from "@/lib/server/oidcConfig";

/**
 * Clear Auth.js session then redirect to IdP end_session (RP-initiated logout).
 */
export async function federatedLogout(): Promise<string | void> {
  const session = await auth();
  const idToken = session?.idToken as string | undefined;
  const postLogoutRedirectUri =
    process.env.NEXTAUTH_URL || process.env.AUTH_URL || "https://nethub.co.ke";

  await signOut({ redirect: false });

  try {
    const discovery = await oidcDiscovery();
    const endSession =
      discovery.end_session_endpoint ||
      `${oidcIssuer()}/oidc/v1/end_session`;

    const url = new URL(endSession);
    url.searchParams.set("client_id", oidcClientId());
    url.searchParams.set(
      "post_logout_redirect_uri",
      postLogoutRedirectUri,
    );
    if (idToken) {
      url.searchParams.set("id_token_hint", idToken);
    }
    return url.toString();
  } catch (e) {
    console.error("OIDC logout discovery failed:", e);
    return postLogoutRedirectUri;
  }
}
