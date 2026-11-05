import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { listMyApplications } from "@/lib/applications";

export default async function RequestsPage() {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/dashboard/requests");

  let apps: Array<{
    id: string;
    title: string;
    status: string;
    service?: { short_title?: string; title?: string };
  }> = [];
  let error: string | null = null;
  try {
    apps = await listMyApplications();
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load requests";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">My requests</h1>
          <p className="mt-1 text-sm text-ink-muted">Quotes and conversations with our team.</p>
        </div>
        <Link href="/dashboard/requests/new" className="nh-btn-primary">
          New request
        </Link>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      {!error && apps.length === 0 && (
        <div className="nh-card">
          <p className="text-sm text-ink-muted">You have not sent a request yet.</p>
          <Link href="/dashboard/requests/new" className="nh-link mt-3 inline-block text-sm">
            Start a quote request →
          </Link>
        </div>
      )}
      <ul className="space-y-3">
        {apps.map((a) => (
          <li key={a.id}>
            <Link
              href={`/dashboard/requests/${a.id}`}
              className="nh-card block transition hover:border-brand/40"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-medium text-ink">{a.title || "Request"}</h2>
                <span className="rounded-full bg-surface-raised px-2.5 py-0.5 text-xs text-ink-muted">
                  {a.status.replace("_", " ")}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                {a.service?.short_title || a.service?.title || "Service"}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
