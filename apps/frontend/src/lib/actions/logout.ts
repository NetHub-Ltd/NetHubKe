"use server";

import { signOut } from "@/auth";
import { readServerAuthToken } from "@/lib/server/auth-session";
import { oidcClientId, oidcDiscovery } from "@/lib/server/oidcConfig";

/** Clear the local session and use the configured provider's OIDC logout endpoint. */
export async function federatedLogout(): Promise<string | void> {
  // Read the encrypted cookie before signOut clears it. Never expose the ID token.
  const token = await readServerAuthToken();
  const idToken = token?.idToken;
  const postLogoutRedirectUri =
    process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://nethub.co.ke";

  await signOut({ redirect: false });

  try {
    const discovery = await oidcDiscovery();
    if (!discovery.end_session_endpoint) return postLogoutRedirectUri;

    const url = new URL(discovery.end_session_endpoint);
    url.searchParams.set("client_id", oidcClientId());
    url.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);
    if (idToken) url.searchParams.set("id_token_hint", idToken);
    return url.toString();
  } catch (error) {
    console.error("OIDC logout discovery failed:", error);
    return postLogoutRedirectUri;
  }
}
