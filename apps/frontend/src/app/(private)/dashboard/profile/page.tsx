"use client";

import { useState } from "react";
import {
  RefreshCcw,
  AlertCircle,
  User,
  Mail,
  Building2,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { useUser } from "@/lib/hooks/useauth";
import { federatedLogout } from "@/lib/actions/logout";
import DashboardShell from "@/lib/components/dashboard/DashboardShell";
import { Button, Field, Input } from "@/lib/components/ui";
import { toast } from "sonner";

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

type AuthUser = NonNullable<ReturnType<typeof useUser>["user"]>;

function ProfileForm({ user, refresh }: { user: AuthUser; refresh: () => Promise<void> | void }) {
  const [fullName, setFullName] = useState(user.full_name ?? "");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    const next = fullName.trim();
    if (!next) {
      toast.error("Name is required");
      return;
    }
    if (next === user.full_name) {
      setDirty(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/nethub/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(
          typeof data.detail === "string" ? data.detail : "Could not update profile",
        );
        return;
      }
      toast.success("Profile updated");
      setFullName(next);
      setDirty(false);
      await refresh();
    } catch {
      toast.error("Could not update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-space-xl">
      <div>
        <p className="font-label-sm text-on-surface-variant">Account</p>
        <h2 className="font-headline-lg mt-space-2xs text-on-surface tracking-tight">
          Profile
        </h2>
        <p className="font-body-md mt-space-sm text-on-surface-variant">
          Your NetHub identity. Email is managed by your sign-in provider.
        </p>
      </div>

      <form onSubmit={onSave} className="card-surface space-y-space-md">
        <h3 className="font-headline-sm text-on-surface">Display name</h3>
        <Field label="Full name" htmlFor="full_name">
          <Input
            id="full_name"
            name="full_name"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setDirty(e.target.value.trim() !== (user.full_name || ""));
            }}
            autoComplete="name"
            required
          />
        </Field>
        <div className="flex items-center gap-space-sm">
          <Button type="submit" variant="primary" loading={saving} disabled={!dirty || saving}>
            Save changes
          </Button>
          {dirty ? (
            <button
              type="button"
              className="font-body-sm text-on-surface-variant hover:text-on-surface"
              onClick={() => {
                setFullName(user.full_name || "");
                setDirty(false);
              }}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <section className="card-surface">
        <h3 className="font-headline-sm mb-space-md text-on-surface">Account details</h3>
        <dl className="divide-y divide-outline-variant/30">
          <div className="flex gap-3 py-3">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-on-surface-variant" />
            <div className="min-w-0">
              <dt className="font-label-sm text-on-surface-variant">Email</dt>
              <dd className="font-body-md truncate text-on-surface">{user.email}</dd>
            </div>
          </div>
          <div className="flex gap-3 py-3">
            <User className="mt-0.5 h-4 w-4 shrink-0 text-on-surface-variant" />
            <div className="min-w-0">
              <dt className="font-label-sm text-on-surface-variant">Username</dt>
              <dd className="font-body-md truncate text-on-surface">
                {user.username || "—"}
              </dd>
            </div>
          </div>
          <div className="flex gap-3 py-3">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-on-surface-variant" />
            <div className="min-w-0">
              <dt className="font-label-sm text-on-surface-variant">Organisation</dt>
              <dd className="font-body-md text-on-surface">
                {user.tenant_name || "—"}
                {user.tenant_tier ? (
                  <span className="ml-2 rounded-full bg-surface-container-high px-2 py-0.5 text-xs capitalize text-on-surface-variant">
                    {user.tenant_tier}
                  </span>
                ) : null}
              </dd>
            </div>
          </div>
          <div className="flex gap-3 py-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-on-surface-variant" />
            <div className="min-w-0">
              <dt className="font-label-sm text-on-surface-variant">Status</dt>
              <dd className="font-body-md text-on-surface">
                {user.is_active ? "Active" : "Inactive"}
              </dd>
            </div>
          </div>
          <div className="flex gap-3 py-3">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-on-surface-variant" />
            <div className="min-w-0">
              <dt className="font-label-sm text-on-surface-variant">Member since</dt>
              <dd className="font-body-md text-on-surface">{formatDate(user.created_at)}</dd>
            </div>
          </div>
        </dl>
      </section>
    </div>
  );
}

/**
 * Profile: view NetHub user + edit display name (UserUpdate.full_name).
 */
export default function ProfilePage() {
  const { user, status: authStatus, refresh } = useUser();

  if (authStatus === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (
    authStatus === "stale" ||
    authStatus === "unauthenticated" ||
    authStatus === "error" ||
    !user
  ) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface p-space-md">
        <div className="card-surface max-w-md text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-error" />
          <h2 className="font-headline-sm mt-space-md text-on-surface">
            Unable to load profile
          </h2>
          <Button
            type="button"
            variant="primary"
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

  return (
    <DashboardShell title="Profile" user={user}>
      <ProfileForm
        key={`${user.id ?? "anon"}:${user.full_name ?? ""}`}
        user={user}
        refresh={() => refresh()}
      />
    </DashboardShell>
  );
}
