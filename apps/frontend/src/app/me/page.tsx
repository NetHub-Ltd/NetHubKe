import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMe } from "@/lib/backend";
import { getIdpAccessToken } from "@/lib/session-token";

export default async function MePage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const accessToken = await getIdpAccessToken();
  let user = null;
  let error: string | null = null;

  if (!accessToken) {
    error = "No IdP access token in session. Sign out and sign in again.";
  } else {
    try {
      user = await getMe(accessToken);
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to load profile";
    }
  }

  return (
    <main>
      <header>
        <h1>Your profile</h1>
        <Link href="/">Home</Link>
      </header>
      <div className="card">
        {error && <p className="muted">{error}</p>}
        {user && (
          <>
            <p>
              <strong>{user.full_name || user.username}</strong>
            </p>
            <p className="muted">{user.email}</p>
            <pre>{JSON.stringify(user, null, 2)}</pre>
            <p className="muted">
              Resolved by NetHubKe resource server (same contract as Tawala / NetPay clients).
            </p>
          </>
        )}
      </div>
    </main>
  );
}
