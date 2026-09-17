"use client";

import Link from "next/link";
import {
  RefreshCcw,
  AlertCircle,
  LayoutDashboard,
  Boxes,
  User,
  ArrowRight,
} from "lucide-react";
import { useUser } from "@/lib/hooks/useauth";
import { federatedLogout } from "@/lib/actions/logout";
import DashboardShell from "@/lib/components/dashboard/DashboardShell";

/**
 * N6 dashboard Home — overview, not a redirect to Profile.
 */
export default function DashboardHomePage() {
  const { user, status: authStatus } = useUser();

  if (authStatus === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <div className="text-center">
          <RefreshCcw className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-on-surface-variant">Loading…</p>
        </div>
      </div>
    );
  }

  if (authStatus === "stale" || authStatus === "unauthenticated") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface p-4">
        <div className="max-w-md rounded-xl border border-error-container bg-surface-container-lowest p-8 text-center shadow-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-error" />
          <h2 className="mt-4 text-xl font-bold text-on-surface">Session Expired</h2>
          <p className="mt-2 text-on-surface-variant">
            Your security token is no longer valid. Please sign in again.
          </p>
          <button
            type="button"
            onClick={async () => {
              const url = await federatedLogout();
              if (url) window.location.href = url;
            }}
            className="mt-6 w-full rounded-lg bg-primary px-4 py-2 font-semibold text-on-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const firstName = (user?.full_name || user?.username || "there").split(" ")[0];

  return (
    <DashboardShell title="Home" user={user}>
      <div className="mx-auto max-w-4xl space-y-8">
        <header>
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-primary" aria-hidden />
            <div>
              <h1 className="text-2xl font-bold text-on-surface">
                Welcome back, {firstName}
              </h1>
              <p className="text-sm text-on-surface-variant">
                Manage your NetHub profile and connected products from one place.
              </p>
            </div>
          </div>
        </header>

        <section
          className="grid gap-4 sm:grid-cols-2"
          aria-label="Quick links"
        >
          <Link
            href="/dashboard/services"
            className="group flex flex-col rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm transition hover:border-primary/40 hover:shadow-md"
          >
            <Boxes className="h-8 w-8 text-primary" aria-hidden />
            <h2 className="mt-3 text-lg font-semibold text-on-surface">
              My services
            </h2>
            <p className="mt-1 flex-1 text-sm text-on-surface-variant">
              See which products are connected, on trial, or available to link.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>

          <Link
            href="/dashboard/profile"
            className="group flex flex-col rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm transition hover:border-primary/40 hover:shadow-md"
          >
            <User className="h-8 w-8 text-primary" aria-hidden />
            <h2 className="mt-3 text-lg font-semibold text-on-surface">Profile</h2>
            <p className="mt-1 flex-1 text-sm text-on-surface-variant">
              View and update your account details and tenant information.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        </section>

        {(user?.tenant_name || user?.email) && (
          <section
            className="rounded-xl border border-outline-variant/20 bg-surface-container-low/50 p-4 text-sm text-on-surface-variant"
            aria-label="Account summary"
          >
            {user?.email && (
              <p>
                <span className="font-medium text-on-surface">Signed in as</span>{" "}
                {user.email}
              </p>
            )}
            {user?.tenant_name && (
              <p className="mt-1">
                <span className="font-medium text-on-surface">Tenant</span>{" "}
                {user.tenant_name}
                {user.tenant_tier ? ` · ${user.tenant_tier}` : null}
              </p>
            )}
          </section>
        )}
      </div>
    </DashboardShell>
  );
}
