import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardHomePage() {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Welcome back</h1>
        <p className="mt-2 max-w-xl text-sm text-ink-muted">
          Track quote requests, reply to our team, and keep your project details in one place.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/requests/new"
          className="nh-card block transition hover:border-brand/40 hover:shadow-nh-glow"
        >
          <h2 className="font-semibold text-ink">Request a quote</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Tell us what you need — websites, apps, SEO, or business systems.
          </p>
        </Link>
        <Link
          href="/dashboard/requests"
          className="nh-card block transition hover:border-brand/40 hover:shadow-nh-glow"
        >
          <h2 className="font-semibold text-ink">My requests</h2>
          <p className="mt-2 text-sm text-ink-muted">
            See status and messages from the NetHub team.
          </p>
        </Link>
      </div>
    </div>
  );
}
