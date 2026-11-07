"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "prepared" | "error";
const serviceOptions = ["Websites & web applications", "Mobile applications", "SEO & conversion improvement", "Business technology & infrastructure", "Something else"];
type ContactFormProps = { initialService?: string };

export function ContactForm({ initialService }: ContactFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const selectedService = serviceOptions.includes(initialService ?? "") ? initialService : "";
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("idle");
    if (!contactEmail) {
      setStatus("error");
      setError("Email enquiries are not configured yet. Please contact NetHub through an official contact channel.");
      return;
    }
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const company = String(data.get("company") || "").trim();
    const service = String(data.get("service") || "").trim();
    const message = String(data.get("message") || "").trim();
    if (!name || !email || !message) {
      setStatus("error");
      setError("Please complete your name, email address and message.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setError("Enter a valid email address, for example name@example.com.");
      return;
    }
    const subject = encodeURIComponent(`Business enquiry from ${name}`);
    const body = encodeURIComponent([
      `Name: ${name}`,
      `Email: ${email}`,
      `Business: ${company || "Not provided"}`,
      `Interested in: ${service || "Not specified"}`,
      "",
      message,
    ].join("\n"));
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
    setStatus("prepared");
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
      {status === "prepared" && <p className="mt-4 rounded-lg bg-cyan-50 px-4 py-3 text-sm text-cyan-900" role="status">Your email app should open with a prepared message. Review it and press Send to complete your enquiry. NetHub has not received it until you send it.</p>}
      <button type="submit" className="nh-btn-primary mt-6 w-full sm:w-auto">Prepare enquiry email <span aria-hidden>↗</span></button>
      <p className="mt-4 text-xs leading-relaxed text-ink-subtle">
        Your details are used only to prepare the email draft. This website does not submit or store your enquiry.
        {contactEmail && <> Prefer to email directly? <a className="nh-link" href={`mailto:${contactEmail}`}>{contactEmail}</a>.</>}
      </p>
    </form>
  );
}
