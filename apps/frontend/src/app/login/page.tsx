import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <main>
      <h1>Sign in</h1>
      <p className="muted">Uses your configured OIDC IdP (Auth.js). No vendor lock-in in code.</p>
      <div className="card" style={{ marginTop: "1rem" }}>
        <form
          action={async () => {
            "use server";
            await signIn("oidc", { redirectTo: "/me" });
          }}
        >
          <button type="submit" className="btn">
            Continue with OIDC
          </button>
        </form>
      </div>
    </main>
  );
}
