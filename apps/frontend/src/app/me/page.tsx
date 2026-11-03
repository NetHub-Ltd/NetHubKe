import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { getMe, getBackendBaseUrl, probeBackend } from "@/lib/backend";
import {
  decodeJwtPayload,
  getIdpAccessToken,
  getIdpIdToken,
  getAuthJwt,
  listAuthCookieNames,
  sessionCookieName,
} from "@/lib/session-token";
import { TokenBlock } from "@/components/TokenBlock";

export default async function MePage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const accessToken = await getIdpAccessToken();
  const idToken = await getIdpIdToken();
  const jwt = await getAuthJwt();
  const cookieNames = await listAuthCookieNames();

  let user = null;
  let profileError: string | null = null;
  if (!accessToken) {
    profileError = "No IdP access token in session JWT. Sign out and sign in again.";
  } else {
    try {
      user = await getMe(accessToken);
    } catch (e) {
      profileError = e instanceof Error ? e.message : "Failed to load profile";
    }
  }

  const health = await probeBackend("/health");
  const ready = await probeBackend("/ready");
  const diag = await probeBackend("/diagnostics");

  const accessClaims = accessToken ? decodeJwtPayload(accessToken) : null;
  const idClaims = idToken ? decodeJwtPayload(idToken) : null;

  return (
    <main>
      <header>
        <h1>Your profile</h1>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Link href="/">Home</Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button type="submit" className="btn btn-ghost">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="card">
        <h2 style={{ fontSize: "1.1rem", marginTop: 0 }}>NetHubKe user</h2>
        {profileError && <p className="muted">{profileError}</p>}
        {user && (
          <>
            <p>
              <strong>{user.full_name || user.username}</strong>
            </p>
            <p className="muted">{user.email}</p>
            <pre>{JSON.stringify(user, null, 2)}</pre>
          </>
        )}
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h2 style={{ fontSize: "1.1rem", marginTop: 0 }}>Diagnostics — tokens</h2>
        <p className="muted">
          Server-side session JWT keys:{" "}
          {jwt ? Object.keys(jwt).join(", ") : "(jwt not readable)"}
        </p>
        <p className="muted">
          Expected cookie: <code>{sessionCookieName()}</code> · seen:{" "}
          {cookieNames.length ? cookieNames.join(", ") : "(none)"}
        </p>
        <TokenBlock title="Access token" token={accessToken} claims={accessClaims} />
        <TokenBlock title="ID token" token={idToken} claims={idClaims} />
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h2 style={{ fontSize: "1.1rem", marginTop: 0 }}>Diagnostics — backend reachability</h2>
        <p className="muted">
          NETHUB_API_URL: <code>{getBackendBaseUrl() ?? "(not set)"}</code>
        </p>
        <pre>
          {JSON.stringify(
            {
              health,
              ready,
              diagnostics: diag,
            },
            null,
            2
          )}
        </pre>
        <p className="muted">
          AUTH_URL: <code>{process.env.AUTH_URL || process.env.NEXTAUTH_URL || "(not set)"}</code>
          <br />
          OIDC issuer: <code>{process.env.AUTH_OIDC_ISSUER || "(not set)"}</code>
        </p>
        <p className="muted">
          JSON diagnostics also at <code>/api/bff/diagnostics</code>
        </p>
      </div>
    </main>
  );
}
