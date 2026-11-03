import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";

/** Server-only: IdP access token from Auth.js JWT cookie. */
export async function getIdpAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const token = await getToken({
    req: {
      headers: {
        cookie: cookieHeader,
        get(name: string) {
          if (name.toLowerCase() === "cookie") return cookieHeader;
          return undefined;
        },
      },
    } as never,
    secret: process.env.AUTH_SECRET,
  });

  return typeof token?.accessToken === "string" ? token.accessToken : undefined;
}
