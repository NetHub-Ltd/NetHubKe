import Link from "next/link";
import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <main className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_18%_18%,rgba(37,99,235,0.22),transparent_42%),radial-gradient(ellipse_at_82%_78%,rgba(8,145,178,0.18),transparent_42%),linear-gradient(135deg,#eef4ff_0%,#f8fafc_52%,#eaf9fb_100%)] px-5 py-16">
      <div className="pointer-events-none absolute -left-24 top-12 -z-10 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-24 -right-20 -z-10 h-80 w-80 rounded-full bg-cyan-300/30 blur-3xl" aria-hidden />

      <div className="w-full max-w-md">
        <section
          aria-labelledby="login-title"
          className="rounded-[2rem] border border-white/80 bg-white/90 p-8 shadow-[0_24px_80px_rgba(35,51,70,0.14)] backdrop-blur-xl sm:p-10"
        >
          <div className="mb-9 flex flex-col items-center text-center">
            <Link href="/" aria-label="NetHub home" className="mb-7 inline-flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand font-display text-xl font-semibold text-white shadow-lg shadow-blue-900/15">
                N
              </span>
              <span className="font-display text-2xl font-semibold tracking-tight text-ink">
                NetHub<span className="text-brand">.</span>
              </span>
            </Link>
            <p className="nh-eyebrow">Your account</p>
            <h1 id="login-title" className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
              Log in with NetHub
            </h1>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
              Welcome back. Continue securely to your NetHub account.
            </p>
          </div>

          <form
            action={async () => {
              "use server";
              await signIn("oidc", { redirectTo: "/me" });
            }}
          >
            <button type="submit" className="nh-btn-primary min-h-12 w-full rounded-xl">
              Continue with NetHub
              <span aria-hidden>↗</span>
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-relaxed text-ink-subtle">
            You’ll be securely redirected to complete sign-in.
          </p>
        </section>

        <p className="mt-7 text-center text-xs text-ink-subtle">
          © {new Date().getFullYear()} NetHub. All rights reserved.
        </p>
      </div>
    </main>
  );
}
