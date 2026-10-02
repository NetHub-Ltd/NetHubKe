"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  RefreshCcw,
  AlertCircle,
  LayoutDashboard,
  Boxes,
  User,
  ArrowRight,
  Shield,
} from "lucide-react";
import { useUser } from "@/lib/hooks/useauth";
import { federatedLogout } from "@/lib/actions/logout";
import DashboardShell from "@/lib/components/dashboard/DashboardShell";

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="font-label-sm text-on-surface-variant">{label}</dt>
      <dd className="font-body-md mt-space-2xs truncate text-on-surface">
        {value?.trim() ? value : "—"}
      </dd>
    </div>
  );
}

/**
 * Post-login home: route is /dashboard (signIn callbackUrl).
 * Shows IdP (Zitadel) identity + app user from /users/sync.
 */
export default function DashboardHomePage() {
  const { user, status: authStatus } = useUser();
  const { data: session } = useSession();

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

  if (authStatus === "stale" || authStatus === "unauthenticated") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface p-space-md">
        <div className="card-surface max-w-md text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-error" />
          <h2 className="font-headline-sm mt-space-md text-on-surface">
            Session expired
          </h2>
          <p className="font-body-md mt-space-sm text-on-surface-variant">
            Your session is no longer valid. Sign in again to continue.
          </p>
          <button
            type="button"
            onClick={async () => {
              const url = await federatedLogout();
              if (url) window.location.href = url;
            }}
            className="btn-primary mt-space-lg w-full"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  const idp = session?.idp;
  const displayName =
    user?.full_name ||
    idp?.name ||
    user?.username ||
    idp?.preferredUsername ||
    "there";
  const firstName = displayName.split(" ")[0];

  return (
    <DashboardShell title="Home" user={user}>
      <div className="mx-auto max-w-4xl space-y-space-xl">
        <header className="flex items-start gap-space-md">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-muted text-primary">
            <LayoutDashboard className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h1 className="font-headline-md text-on-surface">
              Welcome back, {firstName}
            </h1>
            <p className="font-body-md mt-space-2xs text-on-surface-variant">
              Signed in with NetHub ID. Account details below come from your
              identity provider and your NetHub profile.
            </p>
          </div>
        </header>

        {/* Identity from Zitadel / OIDC + app sync */}
        <section className="card-surface" aria-labelledby="identity-heading">
          <div className="mb-space-lg flex items-center gap-space-sm">
            <Shield className="h-5 w-5 text-primary" aria-hidden />
            <h2 id="identity-heading" className="font-headline-sm text-on-surface">
              Your identity
            </h2>
          </div>
          <dl className="grid gap-space-md sm:grid-cols-2">
            <Field label="Name" value={user?.full_name || idp?.name} />
            <Field
              label="Email"
              value={user?.email || idp?.email || undefined}
            />
            <Field
              label="Username"
              value={user?.username || idp?.preferredUsername}
            />
            <Field
              label="Email verified (IdP)"
              value={
                idp?.emailVerified === undefined
                  ? undefined
                  : idp.emailVerified
                    ? "Yes"
                    : "No"
              }
            />
            <Field label="IdP subject (sub)" value={idp?.sub} />
            <Field label="NetHub user id" value={user?.id} />
            <Field label="Tenant" value={user?.tenant_name || user?.tenant_id} />
            <Field
              label="Account status"
              value={user?.is_active ? "Active" : "Inactive"}
            />
          </dl>
        </section>

        <section
          className="grid gap-space-md sm:grid-cols-2"
          aria-label="Quick links"
        >
          <Link
            href="/dashboard/services"
            className="card-surface group flex flex-col transition hover:border-primary/40 hover:shadow-md"
          >
            <Boxes className="h-8 w-8 text-primary" aria-hidden />
            <h2 className="font-headline-sm mt-space-md text-on-surface">
              My services
            </h2>
            <p className="font-body-sm mt-space-xs flex-1 text-on-surface-variant">
              Connected products, trials, and available links.
            </p>
            <span className="font-label-md mt-space-md inline-flex items-center gap-space-2xs text-primary">
              Open
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>

          <Link
            href="/dashboard/profile"
            className="card-surface group flex flex-col transition hover:border-primary/40 hover:shadow-md"
          >
            <User className="h-8 w-8 text-primary" aria-hidden />
            <h2 className="font-headline-sm mt-space-md text-on-surface">
              Profile
            </h2>
            <p className="font-body-sm mt-space-xs flex-1 text-on-surface-variant">
              Update account details and tenant information.
            </p>
            <span className="font-label-md mt-space-md inline-flex items-center gap-space-2xs text-primary">
              Open
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        </section>
      </div>
    </DashboardShell>
  );
}
