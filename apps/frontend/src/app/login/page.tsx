import type { Metadata } from "next";
import Link from "next/link";
import { signIn } from "@/auth";

export const metadata: Metadata = {
  title: "Log in with NetHub",
  description: "Sign in securely with your NetHub account.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden px-5 py-12 sm:px-7">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_42%,rgba(255,255,255,0.72),transparent_58%)]"
      />

      <section className="w-full max-w-md rounded-[1.75rem] border border-white/75 bg-white/85 p-7 shadow-[0_24px_80px_rgba(31,49,78,0.16),0_4px_14px_rgba(31,49,78,0.06)] backdrop-blur-2xl sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand font-display text-2xl font-semibold text-white shadow-nh-glow">
          N
        </div>

        <div className="mt-7 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            Your NetHub account
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-[2rem]">
            Log in with NetHub
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
            Welcome back. Sign in securely to continue to your NetHub services.
          </p>
        </div>

        <form
          action={async () => {
            "use server";
            await signIn("oidc", { redirectTo: "/me" });
          }}
        >
          <button type="submit" className="nh-btn-primary mt-8 min-h-12 w-full">
            Continue with NetHub
            <span aria-hidden="true">↗</span>
          </button>
        </form>

        <p className="mt-5 text-center text-xs leading-relaxed text-ink-subtle">
          You’ll be redirected to NetHub’s secure sign-in to verify your account.
        </p>

        <div className="mt-8 border-t border-line pt-5 text-center">
          <Link href="/" className="text-sm font-medium text-ink-muted transition-colors hover:text-brand">
            Back to NetHub
          </Link>
        </div>
      </section>
    </main>
  );
}
