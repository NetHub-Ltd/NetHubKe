import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { adminListApplications } from "@/lib/applications";

export default async function AdminInboxPage() {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/dashboard/admin");

  let apps: Array<{
    id: string;
    title: string;
    status: string;
    service?: { short_title?: string };
  }> = [];
  let error: string | null = null;
  try {
    apps = await adminListApplications();
  } catch (e) {
    error = e instanceof Error ? e.message : "Admin access required";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Admin inbox</h1>
        <p className="mt-1 text-sm text-ink-muted">Incoming quote requests from the website.</p>
      </div>
      {error && (
        <div className="nh-card">
          <p className="text-sm text-ink-muted">{error}</p>
          <p className="mt-2 text-xs text-ink-subtle">
            Your account needs admin access (BOOTSTRAP_ADMIN_EMAILS).
          </p>
        </div>
      )}
      <ul className="space-y-3">
        {apps.map((a) => (
          <li key={a.id}>
            <Link href={`/dashboard/admin/${a.id}`} className="nh-card block hover:border-brand/40">
              <div className="flex justify-between gap-2">
                <span className="font-medium text-ink">{a.title}</span>
                <span className="text-xs text-ink-muted">{a.status}</span>
              </div>
              <p className="mt-1 text-sm text-ink-muted">{a.service?.short_title}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
