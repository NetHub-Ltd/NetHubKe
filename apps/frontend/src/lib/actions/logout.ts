// "use server";

// import { signOut } from "@/auth";

// export async function federatedLogout() {
//   const issuerUrl = process.env.KEYCLOAK_ISSUER;
//   const clientId = process.env.KEYCLOAK_CLIENT_ID;
//   const postLogoutRedirectUri = process.env.NEXTAUTH_URL;

//   // Clear local session
//   await signOut({ redirect: false });

//   // Redirect to Keycloak Logout endpoint
//   if (issuerUrl && clientId) {
//     const logoutUrl = `${issuerUrl}/protocol/openid-connect/logout?client_id=${clientId}&post_logout_redirect_uri=${encodeURIComponent(postLogoutRedirectUri!)}`;
//     return logoutUrl;
//   }
// }

"use server";

import { signOut, auth } from "@/auth";

export async function federatedLogout() {
  const session = await auth();
  const issuerUrl = process.env.KEYCLOAK_ISSUER;
  const clientId = process.env.KEYCLOAK_CLIENT_ID;
  const postLogoutRedirectUri =
    process.env.NEXTAUTH_URL || "http://localhost:3000";

  // 1. Get the id_token if you stored it in the session earlier
  const idToken = session?.id_token;

  // 2. Clear local session (NextAuth cookies)
  await signOut({ redirect: false });

  // 3. Build the OIDC Logout URL
  if (issuerUrl && clientId) {
    const url = new URL(`${issuerUrl}/protocol/openid-connect/logout`);
    url.searchParams.append("client_id", clientId);
    url.searchParams.append("post_logout_redirect_uri", postLogoutRedirectUri);

    // Adding the hint prevents the Keycloak "Confirm Logout" screen
    if (idToken) {
      url.searchParams.append("id_token_hint", idToken);
    }

    return url.toString();
  }
}