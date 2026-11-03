import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";

/**
 * IdP-agnostic OIDC via Auth.js.
 * Configure AUTH_OIDC_* only — no vendor-specific provider module.
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
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      if (account?.expires_at) {
        token.accessTokenExpires = account.expires_at * 1000;
      }
      return token as JWT;
    },
    async session({ session, token }) {
      // access token stays server-side via auth(); not exposed on client session by default
      session.error = token.error as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
});

declare module "next-auth" {
  interface Session {
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}
