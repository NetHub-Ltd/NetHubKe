import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <main>
      <header>
        <div>
          <h1>NetHub</h1>
          <p className="muted">Architecture A — IdP login, BFF → resource server</p>
        </div>
        <div>
          {session ? (
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
          ) : (
            <Link className="btn" href="/login">
              Sign in
            </Link>
          )}
        </div>
      </header>

      <div className="card">
        {session ? (
          <>
            <p>
              Signed in as <strong>{session.user?.email ?? session.user?.name ?? "user"}</strong>
            </p>
            <p className="muted">
              Open <Link href="/me">/me</Link> to resolve your NetHubKe profile via the BFF
              (IdP access token → backend <code>/api/v1/users/me</code>).
            </p>
          </>
        ) : (
          <p className="muted">
            Sign in with your organization IdP. The BFF will call NetHubKe with the same Bearer
            token every client uses — no product-token exchange.
          </p>
        )}
      </div>
    </main>
  );
}
