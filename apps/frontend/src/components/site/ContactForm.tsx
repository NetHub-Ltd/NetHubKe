"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

const serviceOptions = [
  "Websites & web applications",
  "Mobile applications",
  "SEO & conversion improvement",
  "Business technology & infrastructure",
  "Something else",
];

type ContactFormProps = {
  initialService?: string;
};

export function ContactForm({ initialService }: ContactFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const selectedService = serviceOptions.includes(initialService ?? "") ? initialService : "";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("submitting");

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      company: String(data.get("company") || "").trim() || null,
      service: String(data.get("service") || "").trim() || null,
      message: String(data.get("message") || "").trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      setStatus("error");
      setError("Please complete your name, email address and message.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      setStatus("error");
      setError("Enter a valid email address, for example name@example.com.");
      return;
    }

    try {
      const response = await fetch("/api/bff/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let message = "We could not send your enquiry. Please try again shortly.";
        if (response.status === 400) {
          message = "Please check your details and try again.";
        } else if (response.status === 429) {
          message = "Too many enquiries have been submitted. Please try again later.";
        }
        throw new Error(message);
      }

      form.reset();
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "We could not send your enquiry. Please try again shortly.");
    }
  }

  return (
    <form className="rounded-2xl border border-line bg-surface p-6 shadow-nh-card sm:p-8" onSubmit={onSubmit} noValidate>
      <div className="mb-6">
        <h2 className="font-display text-xl font-semibold text-ink">Start a conversation</h2>
        <p className="mt-2 text-sm text-ink-muted">Share the business challenge, opportunity or idea you want to explore. We will help you clarify a practical next step.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="nh-label" htmlFor="contact-name">Your name</label>
          <input id="contact-name" name="name" className="nh-input" autoComplete="name" required aria-describedby={error ? "contact-form-error" : undefined} />
        </div>
        <div>
          <label className="nh-label" htmlFor="contact-email">Email address</label>
          <input id="contact-email" name="email" type="email" className="nh-input" autoComplete="email" required aria-describedby={error ? "contact-form-error" : undefined} />
        </div>
        <div className="sm:col-span-2">
          <label className="nh-label" htmlFor="contact-company">Business or organisation <span className="font-normal text-ink-subtle">(optional)</span></label>
          <input id="contact-company" name="company" className="nh-input" autoComplete="organization" />
        </div>
        <div className="sm:col-span-2">
          <label className="nh-label" htmlFor="contact-service">What would you like help with?</label>
          <select id="contact-service" name="service" className="nh-input" defaultValue={selectedService}>
            <option value="">Choose an area (optional)</option>
            {serviceOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="nh-label" htmlFor="contact-message">Tell us a little about it</label>
          <textarea id="contact-message" name="message" rows={5} className="nh-input resize-y" placeholder="What are you trying to achieve? What is getting in the way?" required aria-describedby={error ? "contact-form-error" : undefined} />
        </div>
      </div>

      {error && <p className="nh-error mt-4" id="contact-form-error" role="alert">{error}</p>}
      {status === "success" && <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-900" role="status">Thank you. Your enquiry has been received. We will respond through the contact details you provided.</p>}

      <button type="submit" className="nh-btn-primary mt-6 w-full sm:w-auto" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send enquiry"}
      </button>

      <p className="mt-4 text-xs leading-relaxed text-ink-subtle">
        Your details are sent securely through NetHub’s enquiry process and used to respond to your request.
      </p>
    </form>
  );
}
