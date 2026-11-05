"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AdminActions({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const body = String(new FormData(e.currentTarget).get("body") || "");
    await fetch(`/api/bff/admin/applications/${applicationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setPending(false);
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  async function setStatus(status: string) {
    setPending(true);
    await fetch(`/api/bff/admin/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <form className="nh-card space-y-3" onSubmit={sendMessage}>
        <label className="nh-label" htmlFor="body">
          Reply to customer
        </label>
        <textarea id="body" name="body" className="nh-input min-h-[80px]" required />
        <button type="submit" className="nh-btn-primary" disabled={pending}>
          Send reply
        </button>
      </form>
      <div className="flex flex-wrap gap-2">
        {["in_review", "quoted", "closed"].map((s) => (
          <button
            key={s}
            type="button"
            className="nh-btn-secondary"
            disabled={pending}
            onClick={() => setStatus(s)}
          >
            Mark {s.replace("_", " ")}
          </button>
        ))}
      </div>
    </div>
  );
}
