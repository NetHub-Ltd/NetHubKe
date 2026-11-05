import Link from "next/link";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { adminGetApplication } from "@/lib/applications";
import { AdminActions } from "./AdminActions";

export default async function AdminDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  const { id } = await params;
  let app;
  try {
    app = await adminGetApplication(id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/dashboard/admin" className="text-sm text-brand hover:underline">
        ← Inbox
      </Link>
      <h1 className="font-display text-2xl font-semibold text-ink">{app.title}</h1>
      <p className="text-sm text-ink-muted">Status: {app.status}</p>
      <div className="nh-card whitespace-pre-wrap text-sm text-ink-muted">{app.body}</div>
      <div className="space-y-3">
        {(app.messages || []).map(
          (m: { id: string; body: string; is_from_admin: boolean }) => (
            <div
              key={m.id}
              className={`rounded-nh border border-line p-3 text-sm ${
                m.is_from_admin ? "bg-brand/10" : "bg-surface"
              }`}
            >
              <p className="text-xs text-ink-subtle">{m.is_from_admin ? "Team" : "Customer"}</p>
              <p className="mt-1 whitespace-pre-wrap">{m.body}</p>
            </div>
          )
        )}
      </div>
      <AdminActions applicationId={app.id} />
    </div>
  );
}
