import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tenantId?: string;
      isActive: boolean;
    } & DefaultSession["user"];
    accessToken: string;
    idToken: string;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    expiresAt?: number;
    user?: {
      id: string;
      tenantId?: string;
      isActive: boolean;
    };
    error?: string;
  }
}
