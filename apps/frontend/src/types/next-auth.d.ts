import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      groups?: string[];
    } & DefaultSession["user"];
  }

  interface JWT {
    accessToken?: string;
    id?: string;
    groups?: string[];
  }
}
