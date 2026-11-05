"use server";

import Link from "next/link";
import { signOut } from "@/auth";
import { DashboardNavigation } from "@/components/dashboard/DashboardNavigation";

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}

function getInitials(value: string): string {
  const parts = value.trim().split(/[\s@._-]+/).filter(Boolean);
  if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0] || "N").slice(0, 2).toUpperCase();
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="NetHub home">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand font-display text-lg font-bold text-white shadow-nh-glow">
        N
      </span>
      <span className="font-display text-xl font-bold tracking-tight text-ink">
        NetHub<span className="text-brand">.</span>
      </span>
    </Link>
  );
}

export function DashboardShell({
  children,
  accountLabel,
}: {
  children: React.ReactNode;
  accountLabel: string;
}) {
  const initials = getInitials(accountLabel);

  return (
    <div className="flex min-h-[100svh] w-full bg-canvas/80">
      <aside className="sticky top-0 hidden h-screen w-[17rem] shrink-0 flex-col border-r border-line/80 bg-white/85 px-5 py-6 backdrop-blur-xl lg:flex">
        <Brand />

        <div className="mt-10">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
            Workspace
          </p>
          <DashboardNavigation />
        </div>

        <div className="mt-auto rounded-2xl border border-line bg-canvas-soft/75 p-4">
          <p className="text-sm font-semibold text-ink">Need a hand?</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            Our team can help with your NetHub account.
          </p>
          <Link href="/contact" className="mt-3 inline-flex text-xs font-semibold text-brand hover:underline">
            Contact support <span aria-hidden="true" className="ml-1">↗</span>
          </Link>
        </div>

        <Link href="/" className="mt-5 px-3 text-xs font-medium text-ink-muted transition-colors hover:text-brand">
          ← Back to NetHub
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-line/80 bg-white/85 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-h-12 items-center gap-4">
            <details className="group relative lg:hidden">
              <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-xl border border-line px-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                </svg>
                Menu
              </summary>
              <div className="absolute left-0 top-full z-40 mt-3 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-line bg-white p-4 shadow-xl">
                <div className="mb-4">
                  <Brand />
                </div>
                <DashboardNavigation />
                <Link href="/contact" className="mt-4 block border-t border-line pt-4 text-sm font-medium text-brand">
                  Contact support
                </Link>
                <Link href="/" className="mt-3 block text-sm font-medium text-ink-muted">
                  Back to NetHub
                </Link>
              </div>
            </details>

            <div className="min-w-0">
              <p className="hidden text-xs font-medium text-ink-subtle sm:block">
                Dashboard <span className="px-1.5 text-line-strong">/</span> Account
              </p>
              <p className="truncate text-sm font-semibold text-ink sm:mt-1">My profile</p>
            </div>

            <div className="ml-auto flex min-w-0 items-center gap-3">
              <div className="hidden min-w-0 text-right sm:block">
                <p className="max-w-48 truncate text-sm font-semibold text-ink">{accountLabel}</p>
                <p className="text-xs text-ink-subtle">NetHub account</p>
              </div>
              <span
                aria-label={`Signed in as ${accountLabel}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand ring-1 ring-inset ring-brand/15"
              >
                {initials}
              </span>
              <form action={signOutAction}>
                <button type="submit" className="nh-btn-secondary min-h-10 px-3 sm:px-4">
                  <span className="hidden sm:inline">Sign out</span>
                  <span className="sm:hidden">Exit</span>
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="w-full flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
