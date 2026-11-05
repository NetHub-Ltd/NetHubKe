"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Service = { slug: string; title: string; short_title: string };

export function NewRequestForm({
  services,
  defaultSlug,
}: {
  services: Service[];
  defaultSlug: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStatus("submitting");
    const fd = new FormData(e.currentTarget);
    const body = {
      service_slug: String(fd.get("service_slug") || ""),
      title: String(fd.get("title") || ""),
      body: String(fd.get("body") || ""),
      budget_band: String(fd.get("budget_band") || ""),
      timeline: String(fd.get("timeline") || ""),
      contact_phone: String(fd.get("contact_phone") || ""),
    };
    try {
      const res = await fetch("/api/bff/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Could not submit");
      }
      const data = await res.json();
      router.push(`/dashboard/requests/${data.id}`);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not submit");
    }
  }

  return (
    <form className="nh-card space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="nh-label" htmlFor="service_slug">
          Service
        </label>
        <select
          id="service_slug"
          name="service_slug"
          className="nh-input"
          required
          defaultValue={defaultSlug}
        >
          <option value="">Select…</option>
          {services.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.short_title || s.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="nh-label" htmlFor="title">
          Short title
        </label>
        <input id="title" name="title" className="nh-input" placeholder="e.g. Company website redesign" />
      </div>
      <div>
        <label className="nh-label" htmlFor="body">
          What do you need?
        </label>
        <textarea
          id="body"
          name="body"
          className="nh-input min-h-[140px]"
          required
          minLength={10}
          placeholder="Goals, audience, and anything we should know."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="nh-label" htmlFor="budget_band">
            Budget (optional)
          </label>
          <input id="budget_band" name="budget_band" className="nh-input" placeholder="e.g. 50k–150k KES" />
        </div>
        <div>
          <label className="nh-label" htmlFor="timeline">
            Timeline (optional)
          </label>
          <input id="timeline" name="timeline" className="nh-input" placeholder="e.g. 4–6 weeks" />
        </div>
      </div>
      <div>
        <label className="nh-label" htmlFor="contact_phone">
          Phone (optional)
        </label>
        <input id="contact_phone" name="contact_phone" className="nh-input" />
      </div>
      {error && (
        <p className="nh-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="nh-btn-primary" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send request"}
      </button>
    </form>
  );
}
