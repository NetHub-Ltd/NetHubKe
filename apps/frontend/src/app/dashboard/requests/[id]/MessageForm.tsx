"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function MessageForm({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const body = String(fd.get("body") || "");
    try {
      const res = await fetch(`/api/bff/applications/${applicationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) throw new Error(await res.text());
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="nh-card space-y-3" onSubmit={onSubmit}>
      <label className="nh-label" htmlFor="body">
        Add a message
      </label>
      <textarea id="body" name="body" className="nh-input min-h-[80px]" required />
      {error && <p className="nh-error">{error}</p>}
      <button type="submit" className="nh-btn-primary" disabled={pending}>
        {pending ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
