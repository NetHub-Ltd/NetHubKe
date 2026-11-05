import Link from "next/link";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getApplication } from "@/lib/applications";
import { MessageForm } from "./MessageForm";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  const { id } = await params;

  let app: {
    id: string;
    title: string;
    status: string;
    body: string;
    service?: { title?: string };
    messages?: Array<{ id: string; body: string; is_from_admin: boolean; created_at?: string }>;
  } | null = null;
  try {
    app = await getApplication(id);
  } catch {
    notFound();
  }
  if (!app) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/dashboard/requests" className="text-sm text-brand hover:underline">
        ← My requests
      </Link>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-semibold text-ink">{app.title}</h1>
          <span className="rounded-full bg-surface-raised px-2.5 py-0.5 text-xs text-ink-muted">
            {app.status.replace("_", " ")}
          </span>
        </div>
        <p className="mt-1 text-sm text-ink-muted">{app.service?.title}</p>
      </div>
      <div className="nh-card">
        <h2 className="text-sm font-semibold text-ink">Your brief</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-ink-muted">{app.body}</p>
      </div>
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">Conversation</h2>
        {(app.messages || []).length === 0 && (
          <p className="text-sm text-ink-muted">No messages yet. We will reply here.</p>
        )}
        {(app.messages || []).map((m) => (
          <div
            key={m.id}
            className={`rounded-nh border border-line p-3 text-sm ${
              m.is_from_admin ? "bg-brand/10" : "bg-surface"
            }`}
          >
            <p className="text-xs text-ink-subtle">
              {m.is_from_admin ? "NetHub team" : "You"}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-ink">{m.body}</p>
          </div>
        ))}
      </div>
      <MessageForm applicationId={app.id} />
    </div>
  );
}
