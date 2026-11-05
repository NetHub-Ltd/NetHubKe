import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { listServices } from "@/lib/applications";
import { NewRequestForm } from "./NewRequestForm";

export default async function NewRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/dashboard/requests/new");

  const sp = await searchParams;
  let services: Array<{ slug: string; title: string; short_title: string }> = [];
  try {
    services = await listServices();
  } catch {
    services = [];
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Request a quote</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Share what you need. We will respond with a clear next step — not a generic brochure.
        </p>
      </div>
      <NewRequestForm services={services} defaultSlug={sp.service || ""} />
    </div>
  );
}
