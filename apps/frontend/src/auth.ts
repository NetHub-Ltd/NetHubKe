import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";

/**
 * IdP-agnostic OIDC via Auth.js.
 * Access + ID tokens stored on the JWT for server-side BFF use.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    {
      id: "oidc",
      name: "OIDC",
      type: "oidc",
      issuer: process.env.AUTH_OIDC_ISSUER,
      clientId: process.env.AUTH_OIDC_CLIENT_ID,
      clientSecret: process.env.AUTH_OIDC_CLIENT_SECRET,
      wellKnown:
        process.env.AUTH_OIDC_WELL_KNOWN ||
        (process.env.AUTH_OIDC_ISSUER
          ? `${process.env.AUTH_OIDC_ISSUER.replace(/\/$/, "")}/.well-known/openid-configuration`
          : undefined),
      authorization: {
        params: {
          scope: "openid profile email offline_access",
        },
      },
    },
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        token.tokenType = account.token_type;
      }
      return token as JWT;
    },
    async session({ session, token }) {
      session.error = token.error as string | undefined;
      // Diagnostics only: surface presence flags to client session (not full tokens)
      session.hasAccessToken = Boolean(token.accessToken);
      session.hasIdToken = Boolean(token.idToken);
      session.expiresAt = token.expiresAt as number | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  debug: process.env.AUTH_DEBUG === "true",
});

declare module "next-auth" {
  interface Session {
    error?: string;
    hasAccessToken?: boolean;
    hasIdToken?: boolean;
    expiresAt?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    tokenType?: string;
    error?: string;
  }
}
