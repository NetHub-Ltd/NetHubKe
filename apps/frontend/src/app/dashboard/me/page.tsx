import type { Metadata } from "next";
import Link from "next/link";
import { getMe, type NetHubUser } from "@/lib/backend";
import { getIdpAccessToken } from "@/lib/session-token";

export const metadata: Metadata = {
  title: "My profile",
  description: "View your NetHub account profile and membership details.",
};

function formatDate(value?: string): string {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  }).format(date);
}

function getInitials(name?: string, username?: string): string {
  const source = name?.trim() || username?.trim() || "NetHub";
  const parts = source.split(/[\s@._-]+/).filter(Boolean);

  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

function ProfileRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="break-all text-sm font-semibold text-ink sm:text-right">{value}</dd>
    </div>
  );
}

export default async function MyProfilePage() {
  let user: NetHubUser | null = null;
  let profileUnavailable = false;

  try {
    const accessToken = await getIdpAccessToken();

    if (accessToken) {
      // getMe also performs the existing first-login sync when the profile is not found.
      user = await getMe(accessToken);
    } else {
      profileUnavailable = true;
    }
  } catch {
    // Never expose token retrieval or backend diagnostics on a user-facing page.
    profileUnavailable = true;
  }

  const displayName = user?.full_name?.trim() || user?.username || "your NetHub account";
  const firstName = displayName.split(/\s+/)[0];
  const initials = getInitials(user?.full_name, user?.username);

  return (
    <div className="space-y-7">
      <section
        aria-labelledby="account-heading"
        className="relative isolate overflow-hidden rounded-[1.75rem] border border-white/80 bg-gradient-to-br from-white/95 via-white/80 to-cyan-50/80 p-6 shadow-nh-soft sm:p-9"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-28 -z-10 h-72 w-72 rounded-full bg-brand/10 blur-3xl"
        />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-cyan-600 font-display text-2xl font-semibold text-white shadow-nh-glow">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="nh-eyebrow">Your NetHub account</p>
            <h1
              id="account-heading"
              className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
            >
              {user ? `Welcome back, ${firstName}` : "Your account"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
              Your profile and account details, all in one place.
            </p>
          </div>
          {user && (
            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold ${
                user.is_active
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                  : "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200"
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full ${user.is_active ? "bg-emerald-500" : "bg-amber-500"}`}
              />
              {user.is_active ? "Account active" : "Account inactive"}
            </span>
          )}
        </div>
      </section>

      {profileUnavailable || !user ? (
        <section
          role="status"
          className="rounded-2xl border border-amber-200 bg-amber-50/80 p-6 sm:p-8"
        >
          <p className="text-sm font-semibold text-amber-900">Profile details are unavailable</p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-amber-800">
            Your sign-in is recognised, but we couldn’t retrieve your NetHub profile just now.
            Please try again in a moment.
          </p>
          <Link href="/dashboard/me" className="nh-btn-secondary mt-5 border-amber-300 bg-white">
            Try again
          </Link>
        </section>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section aria-labelledby="profile-heading" className="nh-card p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="nh-eyebrow">Personal information</p>
                <h2 id="profile-heading" className="mt-2 font-display text-xl font-semibold text-ink">
                  Profile details
                </h2>
              </div>
              <span className="rounded-xl bg-brand/8 p-3 text-brand" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5 20c.7-3.2 3.2-5 7-5s6.3 1.8 7 5" strokeLinecap="round" />
                </svg>
              </span>
            </div>

            <dl className="mt-7 divide-y divide-line">
              <ProfileRow label="Full name" value={user.full_name || "Not provided"} />
              <ProfileRow label="Email address" value={user.email || "Not provided"} />
              <ProfileRow label="Username" value={user.username || "Not set"} />
            </dl>
          </section>

          <section aria-labelledby="account-details-heading" className="nh-card p-6 sm:p-8">
            <p className="nh-eyebrow">Account overview</p>
            <h2
              id="account-details-heading"
              className="mt-2 font-display text-xl font-semibold text-ink"
            >
              Account details
            </h2>

            <dl className="mt-7 divide-y divide-line">
              <ProfileRow
                label="Account status"
                value={user.is_active ? "Active" : "Inactive"}
              />
              <ProfileRow
                label="Business workspace"
                value={user.tenant_id ? "Linked" : "Not linked"}
              />
              <ProfileRow label="Member since" value={formatDate(user.created_at)} />
              <ProfileRow label="Last updated" value={formatDate(user.updated_at)} />
            </dl>
          </section>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-line/80 pt-6 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <p>Need help with your account?</p>
        <div className="flex items-center gap-4">
          <Link href="/contact" className="nh-link">
            Contact NetHub
          </Link>
          <Link href="/" className="font-medium text-ink-muted transition-colors hover:text-ink">
            Visit homepage <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
