"use client";

import Link from "next/link";
import {
  RefreshCcw,
  AlertCircle,
  ArrowRight,
  Boxes,
  User,
  CreditCard,
  Sparkles,
  Building2,
} from "lucide-react";
import { useUser } from "@/lib/hooks/useauth";
import { federatedLogout } from "@/lib/actions/logout";
import DashboardShell from "@/lib/components/dashboard/DashboardShell";
import { Button } from "@/lib/components/ui";

function firstName(full?: string | null) {
  if (!full?.trim()) return null;
  return full.trim().split(/\s+/)[0];
}

/**
 * Welcome home — clean overview after login.
 */
export default function DashboardHomePage() {
  const { user, status: authStatus } = useUser();

  if (authStatus === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <div className="text-center">
          <RefreshCcw className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="font-body-sm mt-space-sm text-on-surface-variant">
            Loading…
          </p>
        </div>
      </div>
    );
  }

  if (
    authStatus === "stale" ||
    authStatus === "unauthenticated" ||
    authStatus === "error"
  ) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface p-space-md">
        <div className="card-surface max-w-md text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-error" />
          <h2 className="font-headline-sm mt-space-md text-on-surface">
            {authStatus === "error" ? "Couldn’t load your account" : "Session expired"}
          </h2>
          <p className="font-body-md mt-space-sm text-on-surface-variant">
            {authStatus === "error"
              ? "We couldn’t reach your NetHub profile. Try again or sign in again."
              : "Your session is no longer valid. Sign in again to continue."}
          </p>
          <Button
            type="button"
            variant="primary"
            fullWidth
            className="mt-space-lg"
            onClick={async () => {
              const url = await federatedLogout();
              if (url) window.location.href = url;
              else window.location.href = "/login";
            }}
          >
            Sign in again
          </Button>
        </div>
      </div>
    );
  }

  const name = firstName(user?.full_name) || user?.email?.split("@")[0] || "there";

  return (
    <DashboardShell title="Overview" user={user}>
      <div className="mx-auto max-w-5xl space-y-space-xl">
        {/* Welcome */}
        <section className="flex flex-col gap-space-md sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-label-sm text-on-surface-variant">Overview</p>
            <h2 className="font-headline-lg mt-space-2xs text-on-surface tracking-tight">
              Welcome back, {name}
            </h2>
            <p className="font-body-md mt-space-sm max-w-xl text-on-surface-variant">
              Manage your NetHub account, profile, and services from one place.
            </p>
          </div>
          <Link
            href="/dashboard/profile"
            className="btn-secondary inline-flex items-center gap-2 self-start rounded-lg px-4 py-2 text-sm font-semibold"
          >
            Edit profile
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* Account snapshot */}
        <section className="grid gap-space-md sm:grid-cols-3">
          <div className="card-surface">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <User className="h-4 w-4" />
              <span className="font-label-sm">Account</span>
            </div>
            <p className="font-headline-sm mt-space-sm truncate text-on-surface">
              {user?.full_name || "—"}
            </p>
            <p className="font-body-sm mt-space-2xs truncate text-on-surface-variant">
              {user?.email}
            </p>
          </div>
          <div className="card-surface">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <Building2 className="h-4 w-4" />
              <span className="font-label-sm">Organisation</span>
            </div>
            <p className="font-headline-sm mt-space-sm truncate text-on-surface">
              {user?.tenant_name || "Personal"}
            </p>
            <p className="font-body-sm mt-space-2xs capitalize text-on-surface-variant">
              {(user?.tenant_tier || "free").replace(/_/g, " ")} plan
            </p>
          </div>
          <div className="card-surface">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <Sparkles className="h-4 w-4" />
              <span className="font-label-sm">Status</span>
            </div>
            <p className="font-headline-sm mt-space-sm text-on-surface">
              {user?.is_active ? "Active" : "Inactive"}
            </p>
            <p className="font-body-sm mt-space-2xs text-on-surface-variant">
              Profile synced with NetHub
            </p>
          </div>
        </section>

        {/* Quick links */}
        <section>
          <h3 className="font-label-sm mb-space-sm text-on-surface-variant">
            Quick links
          </h3>
          <div className="grid gap-space-md sm:grid-cols-3">
            <Link
              href="/dashboard/services"
              className="card-surface group block transition hover:border-primary/30"
            >
              <Boxes className="h-5 w-5 text-primary" />
              <p className="font-headline-sm mt-space-sm text-on-surface group-hover:text-primary">
                Services
              </p>
              <p className="font-body-sm mt-space-2xs text-on-surface-variant">
                View products linked to your account. Request access is coming next.
              </p>
            </Link>
            <Link
              href="/dashboard/profile"
              className="card-surface group block transition hover:border-primary/30"
            >
              <User className="h-5 w-5 text-primary" />
              <p className="font-headline-sm mt-space-sm text-on-surface group-hover:text-primary">
                Profile
              </p>
              <p className="font-body-sm mt-space-2xs text-on-surface-variant">
                Update your display name and review organisation details.
              </p>
            </Link>
            <Link
              href="/dashboard/billing"
              className="card-surface group block transition hover:border-primary/30"
            >
              <CreditCard className="h-5 w-5 text-primary" />
              <p className="font-headline-sm mt-space-sm text-on-surface group-hover:text-primary">
                Billing
              </p>
              <p className="font-body-sm mt-space-2xs text-on-surface-variant">
                Plan and invoices when billing is enabled for your workspace.
              </p>
            </Link>
          </div>
        </section>

        {/* Services CTA — placeholder for apply flow */}
        <section className="card-surface border border-dashed border-outline-variant/60 bg-surface-container-low/50">
          <div className="flex flex-col gap-space-md sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-headline-sm text-on-surface">
                Need Tawala or NetPay?
              </h3>
              <p className="font-body-sm mt-space-2xs max-w-lg text-on-surface-variant">
                Service applications (choose product, business details, review)
                will live here. For now you can browse what’s available under
                Services.
              </p>
            </div>
            <Link
              href="/dashboard/services"
              className="btn-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold"
            >
              Browse services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
