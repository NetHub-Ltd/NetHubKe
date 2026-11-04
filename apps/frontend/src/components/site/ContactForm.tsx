"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStatus("submitting");

    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    if (!name || !email || !message) {
      setStatus("error");
      setError("Please fill in name, email, and message.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setError("Enter a valid email address.");
      return;
    }

    // Bare minimum: no backend mailer yet — succeed locally and surface next step.
    await new Promise((r) => setTimeout(r, 600));
    setStatus("success");
    form.reset();
  }

  if (status === "success") {
    return (
      <div className="nh-card border-success/30 bg-success/5" role="status">
        <p className="font-medium text-ink">Message recorded</p>
        <p className="mt-2 text-sm text-ink-muted">
          Thanks—we will follow up at the email you provided. For urgent operational issues, use
          your existing NetHub support channel.
        </p>
        <button type="button" className="nh-btn-secondary mt-4" onClick={() => setStatus("idle")}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="nh-card space-y-5" onSubmit={onSubmit} noValidate>
      <div>
        <label className="nh-label" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          name="name"
          className="nh-input"
          autoComplete="name"
          required
          disabled={status === "submitting"}
        />
      </div>
      <div>
        <label className="nh-label" htmlFor="email">
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="nh-input"
          autoComplete="email"
          required
          disabled={status === "submitting"}
        />
      </div>
      <div>
        <label className="nh-label" htmlFor="message">
          How can we help?
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className="nh-input resize-y"
          required
          disabled={status === "submitting"}
        />
      </div>
      {error && (
        <p className="nh-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="nh-btn-primary" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>
      <p className="text-xs text-ink-subtle">
        By contacting us you agree we may reply about your request. We do not sell your details.
      </p>
    </form>
  );
}
