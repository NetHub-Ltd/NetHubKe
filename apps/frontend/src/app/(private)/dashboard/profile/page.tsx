"use client";

import {
  User,
  RefreshCcw,
  AlertCircle,
  Mail,
  Phone,
  AtSign,
  Building2,
  ShieldCheck,
  Calendar,
  Fingerprint,
} from "lucide-react";
import { useUser } from "@/lib/hooks/useauth";
import { federatedLogout } from "@/lib/actions/logout";
import DashboardShell from "@/lib/components/dashboard/DashboardShell";

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex gap-space-md border-b border-border-subtle py-space-md last:border-0">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-muted text-primary">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <dt className="font-label-sm text-on-surface-variant">{label}</dt>
        <dd className="font-body-md mt-space-2xs break-all text-on-surface">
          {value?.toString().trim() ? value : "—"}
        </dd>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, status: authStatus, idp, backendSynced } = useUser();

  if (authStatus === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <div className="text-center">
          <RefreshCcw className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="font-body-sm mt-space-sm text-on-surface-variant">
            Loading your profile…
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
            Sign in again to view your profile.
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

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <DashboardShell title="Profile" user={user}>
      <div className="mx-auto max-w-3xl space-y-space-xl">
        <header className="flex flex-wrap items-start justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary">
              <User className="h-7 w-7" aria-hidden />
            </span>
            <div>
              <h1 className="font-headline-md text-on-surface">
                {user?.full_name || idp?.name || "Your profile"}
              </h1>
              <p className="font-body-md text-on-surface-variant">
                {user?.email || idp?.email || "Signed in with NetHub ID"}
              </p>
            </div>
          </div>
          <span
            className={`font-label-sm rounded-full px-space-md py-space-2xs ${
              backendSynced
                ? "bg-success-emerald-bg text-success-emerald"
                : "bg-primary-muted text-primary"
            }`}
          >
            {backendSynced ? "Synced with NetHub" : "Identity from IdP"}
          </span>
        </header>

        <section className="card-surface" aria-labelledby="account-heading">
          <h2 id="account-heading" className="font-headline-sm mb-space-sm text-on-surface">
            Account
          </h2>
          <dl>
            <Row icon={User} label="Full name" value={user?.full_name || idp?.name} />
            <Row icon={Mail} label="Email" value={user?.email || idp?.email} />
            <Row
              icon={AtSign}
              label="Username"
              value={user?.username || idp?.preferredUsername}
            />
            <Row icon={Phone} label="Phone" value={user?.phone_number} />
            <Row
              icon={ShieldCheck}
              label="Email verified (IdP)"
              value={
                idp?.emailVerified === undefined
                  ? undefined
                  : idp.emailVerified
                    ? "Yes"
                    : "No"
              }
            />
            <Row
              icon={ShieldCheck}
              label="Account status"
              value={user?.is_active ? "Active" : "Inactive"}
            />
          </dl>
        </section>

        <section className="card-surface" aria-labelledby="ids-heading">
          <h2 id="ids-heading" className="font-headline-sm mb-space-sm text-on-surface">
            Identity & organisation
          </h2>
          <dl>
            <Row icon={Fingerprint} label="IdP subject (sub)" value={idp?.sub} />
            <Row icon={Fingerprint} label="NetHub user id" value={user?.id} />
            <Row
              icon={Building2}
              label="Tenant"
              value={user?.tenant_name || user?.tenant_id}
            />
            <Row icon={Building2} label="Tenant tier" value={user?.tenant_tier} />
            <Row icon={Calendar} label="Member since" value={memberSince} />
          </dl>
        </section>

        {!backendSynced ? (
          <p className="font-body-sm text-on-surface-variant">
            Profile is shown from your identity provider. When the NetHub API is
            connected, organisation fields and editable name will sync
            automatically.
          </p>
        ) : null}
      </div>
    </DashboardShell>
  );
}
