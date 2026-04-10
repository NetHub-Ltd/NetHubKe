import NextAuth, { User } from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import { zUserRead } from "./lib/types/api/zod.gen";

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: process.env.NODE_ENV === "development",
  providers: [
    Keycloak({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!, // Required for refresh
      issuer: process.env.KEYCLOAK_ISSUER!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // 1. Initial Sign-in: Sync with Backend and store tokens
      if (account && user) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/sync`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${account.access_token}` },
            },
          );

          if (!response.ok) throw new Error("Backend sync failed");

          const externalUser = await response.json();
          const data = zUserRead.parse(externalUser);

          return {
            ...token,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            expiresAt: account.expires_at! * 1000, // NextAuth uses seconds, we want ms
            user: {
              id: data.id,
              tenantId: data.tenant_id,
              isActive: data.is_active,
              name: data.full_name,
              email: data.email,
            },
          };
        } catch (error) {
          console.error("Auth Handshake Error:", error);
          return { ...token, error: "SyncError" };
        }
      }

      // 2. Return token if it hasn't expired yet
      if (Date.now() < (token.expiresAt as number)) {
        return token;
      }

      // 3. Token expired: Try to refresh it via Keycloak
      try {
        const response = await fetch(
          `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
          {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: process.env.KEYCLOAK_CLIENT_ID!,
              client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
              grant_type: "refresh_token",
              refresh_token: token.refreshToken as string,
            }),
            method: "POST",
          },
        );

        const tokens = await response.json();
        if (!response.ok) throw tokens;

        return {
          ...token,
          accessToken: tokens.access_token,
          expiresAt: Date.now() + tokens.expires_in * 1000,
          // Keycloak might not always return a new refresh token; fallback to the old one
          refreshToken: tokens.refresh_token ?? token.refreshToken,
        };
      } catch (error) {
        console.error("RefreshAccessTokenError", error);
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },

    async session({ session, token }) {
      // 4. Pass the custom data and error state to the client
      if (token) {
        session.user = {
          ...session.user,
          id: (token.user as any)?.id,
          tenantId: (token.user as any)?.tenantId,
          isActive: (token.user as any)?.isActive,
        };
        session.accessToken = token.accessToken as string;
        session.error = token.error as string | undefined;
      }
      return session;
    },
  },
  events: {
    async signOut() {
      // 5. Federated Logout: When NextAuth signs out, notify Keycloak
      const issuerUrl = process.env.KEYCLOAK_ISSUER;
      const clientId = process.env.KEYCLOAK_CLIENT_ID;
      console.log("Federated Logout:", { issuerUrl, clientId});

      if (issuerUrl && clientId) {
        const url = `${issuerUrl}/protocol/openid-connect/logout?client_id=${clientId}&post_logout_redirect_uri=${encodeURIComponent(process.env.NEXTAUTH_URL!)}`;
        try {
          await fetch(url);
        } catch (err) {
          console.error("Federated logout failed", err);
        }
      }
    },
  },
});