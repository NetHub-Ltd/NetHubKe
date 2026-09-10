"use client";

import { useState } from "react";
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
  Save,
} from "lucide-react";
import { useUser } from "@/lib/hooks/useauth";
import { federatedLogout } from "@/lib/actions/logout";
import DashboardShell from "@/lib/components/dashboard/DashboardShell";
import { toast } from "sonner";

/**
 * Default dashboard page: Profile.
 * Displays enriched /users/me data and allows updating full_name.
 */
export default function ProfilePage() {
  const { user, status: authStatus, refresh } = useUser();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);

  if (authStatus === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <div className="text-center">
          <RefreshCcw className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-on-surface-variant">
            Loading your profile…
          </p>
        </div>
      </div>
    );
  }

  if (authStatus === "stale" || authStatus === "unauthenticated") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface p-4">
        <div className="max-w-md rounded-xl bg-surface-container-lowest p-8 text-center shadow-lg border border-error-container">
          <AlertCircle className="mx-auto h-12 w-12 text-error" />
          <h2 className="mt-4 text-xl font-bold text-on-surface">
            Session Expired
          </h2>
          <p className="mt-2 text-on-surface-variant">
            Your security token is no longer valid. Please sign in again.
          </p>
          <button
            type="button"
            onClick={async () => {
              const url = await federatedLogout();
              if (url) window.location.href = url;
            }}
            className="mt-6 w-full rounded-lg bg-primary px-4 py-2 font-semibold text-on-primary hover:opacity-90 transition-opacity"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const startEdit = () => {
    setFullName(user?.full_name || "");
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setFullName("");
  };

  const saveName = async () => {
    const trimmed = fullName.trim();
    if (!trimmed || trimmed === user?.full_name) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/nethub/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: trimmed }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Profile updated");
      setEditing(false);
      await refresh();
    } catch {
      toast.error("Could not update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const tierLabel = user?.tenant_tier
    ? user.tenant_tier.charAt(0).toUpperCase() + user.tenant_tier.slice(1)
    : "—";

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <DashboardShell title="Profile" user={user}>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Your profile</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Account details synced from NetHub Identity.
          </p>
        </div>

        {/* Identity card */}
        <section className="rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-7 w-7" />
              </div>
              <div>
                {editing ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="rounded-lg border border-outline-variant bg-surface px-3 py-1.5 text-lg font-semibold text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      aria-label="Full name"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={saveName}
                      disabled={saving}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-on-primary disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? "Saving…" : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={saving}
                      className="rounded-lg px-3 py-1.5 text-sm text-on-surface-variant hover:bg-surface-container-high"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold text-on-surface">
                      {user?.full_name || "—"}
                    </h3>
                    <button
                      type="button"
                      onClick={startEdit}
                      className="mt-1 text-sm font-medium text-primary hover:underline"
                    >
                      Edit name
                    </button>
                  </>
                )}
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                user?.is_active
                  ? "bg-success-emerald-bg text-success-emerald"
                  : "bg-error-container text-error"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {user?.is_active ? "Active" : "Inactive"}
            </span>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-on-surface-variant" />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                  Email
                </dt>
                <dd className="mt-0.5 text-sm text-on-surface break-all">
                  {user?.email || "—"}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AtSign className="mt-0.5 h-4 w-4 shrink-0 text-on-surface-variant" />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                  Username
                </dt>
                <dd className="mt-0.5 text-sm text-on-surface">
                  {user?.username || "—"}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-on-surface-variant" />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                  Phone
                </dt>
                <dd className="mt-0.5 text-sm text-on-surface">
                  {user?.phone_number || "Not set"}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-on-surface-variant" />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                  Member since
                </dt>
                <dd className="mt-0.5 text-sm text-on-surface">{memberSince}</dd>
              </div>
            </div>
          </dl>
        </section>

        {/* Tenant / identity context */}
        <section className="rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-on-surface">
              Organization
            </h3>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                Tenant
              </dt>
              <dd className="mt-0.5 text-sm text-on-surface">
                {user?.tenant_name || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                Plan
              </dt>
              <dd className="mt-0.5 text-sm text-on-surface">{tierLabel}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                Tenant ID
              </dt>
              <dd className="mt-0.5 font-mono text-xs text-on-surface-variant break-all">
                {user?.tenant_id || "—"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                Account ID
              </dt>
              <dd className="mt-0.5 font-mono text-xs text-on-surface-variant break-all">
                {user?.id || "—"}
              </dd>
            </div>
          </dl>
        </section>

        {process.env.NODE_ENV === "development" && (
          <details className="rounded-lg bg-inverse-surface p-4 text-inverse-on-surface">
            <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider opacity-70">
              Dev: UserRead payload
            </summary>
            <pre className="mt-3 overflow-x-auto text-xs font-mono text-inverse-primary">
              {JSON.stringify(user, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </DashboardShell>
  );
}
