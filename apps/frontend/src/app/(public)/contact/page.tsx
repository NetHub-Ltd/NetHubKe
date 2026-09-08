"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([
    "M-Pesa Daraja 3.0 Gateway",
  ]);
  const [timeline, setTimeline] = useState("1 Month");
  const [budget, setBudget] = useState("KSh 75k - 150k (Enterprise Web/Hub)");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [details, setDetails] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleObjective = (obj: string) => {
    if (selectedObjectives.includes(obj)) {
      if (selectedObjectives.length > 1) {
        setSelectedObjectives(selectedObjectives.filter((item) => item !== obj));
      }
    } else {
      setSelectedObjectives([...selectedObjectives, obj]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full bg-surface">
      {/* Hero Header Section */}
      <section className="relative w-full bg-surface-canvas overflow-hidden pt-space-3xl pb-space-3xl border-b border-border-subtle/60">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -top-32 right-0 w-[540px] h-[540px] bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-20 w-[420px] h-[420px] bg-secondary-container/40 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop relative z-10">
          {/* Breadcrumb & SLA Marker */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-xl">
            <div className="inline-flex items-center gap-space-xs bg-brand-cobalt-light px-space-md py-space-2xs rounded-full">
              <span className="font-metric-mono text-metric-mono text-primary font-bold tracking-widest uppercase">
                PROJECT INTAKE &amp; TECHNICAL DISCOVERY
              </span>
            </div>
            <div className="inline-flex items-center gap-space-xs bg-surface-subtle px-space-md py-space-2xs rounded-full text-slate-text-muted">
              <span className="material-symbols-outlined text-[16px] text-primary">
                schedule
              </span>
              <span className="font-metric-mono text-metric-mono uppercase tracking-wider">
                Direct Engineering Dispatch • &lt; 4h SLA Response
              </span>
            </div>
          </div>

          <div className="max-w-3xl flex flex-col gap-space-md">
            <h1 className="font-display-xl text-display-xl text-on-surface tracking-tight font-extrabold">
              Let&apos;s Architect Your <br className="hidden sm:inline" />
              <span className="text-primary-container">Next Digital Foundation.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-slate-text-muted leading-relaxed">
              Whether you require high-throughput Daraja 3.0 M-Pesa gateways,
              cloud backend modernization, or an end-to-end web system with
              sub-200ms TTFB—our engineering leadership is ready to review your
              specifications.
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid: Info Sidebar & Intake Form */}
      <section className="w-full bg-surface py-space-4xl">
        <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl items-start">
            {/* Left Sidebar: Direct Channels & Telemetry */}
            <div className="lg:col-span-4 flex flex-col gap-space-xl">
              {/* Direct Channels Card */}
              <div className="bg-surface-canvas p-space-xl rounded-xl shadow-sm border border-border-subtle flex flex-col gap-space-lg">
                <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
                  DIRECT CHANNELS
                </span>

                <div className="flex flex-col gap-space-md">
                  <div className="flex items-start gap-space-sm">
                    <div className="w-10 h-10 rounded-lg bg-brand-cobalt-light text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">
                        location_on
                      </span>
                    </div>
                    <div>
                      <span className="font-label-md text-label-md text-on-surface font-bold block">
                        Westlands Nairobi, Kenya
                      </span>
                      <span className="font-body-sm text-body-sm text-slate-text-muted leading-snug block">
                        The Mirage Towers, Mezzanine 2, Chiromo Rd
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-space-sm">
                    <div className="w-10 h-10 rounded-lg bg-brand-cobalt-light text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">
                        call
                      </span>
                    </div>
                    <div>
                      <span className="font-label-md text-label-md text-on-surface font-bold block">
                        +254 783 202 527
                      </span>
                      <span className="font-body-sm text-body-sm text-slate-text-muted leading-snug block">
                        Direct Engineering &amp; Client Line
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-space-sm">
                    <div className="w-10 h-10 rounded-lg bg-brand-cobalt-light text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">
                        mail
                      </span>
                    </div>
                    <div>
                      <span className="font-label-md text-label-md text-on-surface font-bold block">
                        support@nethub.co.ke
                      </span>
                      <span className="font-body-sm text-body-sm text-slate-text-muted leading-snug block">
                        PGP-Encrypted Project Intake
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Production Queue Telemetry Card */}
              <div className="bg-surface-canvas p-space-xl rounded-xl shadow-sm border border-border-subtle flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <span className="font-metric-mono text-metric-mono text-slate-text-muted font-bold uppercase">
                    CURRENT DISPATCH STATUS
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-emerald opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-success-emerald"></span>
                    </span>
                    <span className="font-metric-mono text-[11px] text-success-emerald font-bold">
                      ACTIVE
                    </span>
                  </div>
                </div>

                <div className="space-y-space-xs pt-space-2xs text-body-sm font-body-sm">
                  <div className="flex justify-between py-1 border-b border-border-subtle/50">
                    <span className="text-slate-text-muted">Sprint Capacity:</span>
                    <span className="text-on-surface font-semibold">
                      Q3 Active Sprint Slots Available
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border-subtle/50">
                    <span className="text-slate-text-muted">Next Review Cycle:</span>
                    <span className="text-on-surface font-semibold">&lt; 4 Business Hours</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-text-muted">Security Level:</span>
                    <span className="text-on-surface font-semibold">
                      ISO/IEC 27001 &amp; Kenya DPA 2019
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Booking Callout Card */}
              <div className="bg-brand-cobalt-light p-space-xl rounded-xl border border-primary/20 flex flex-col gap-space-sm">
                <span className="font-headline-sm text-headline-sm text-primary font-bold">
                  Need an Immediate Call?
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Skip the written form and book a direct 45-minute architectural
                  review with our Lead Systems Architect.
                </p>
                <Link
                  href="/schedule"
                  className="mt-space-xs inline-flex items-center gap-space-xs text-primary font-label-md text-label-md font-bold hover:underline"
                >
                  <span>Open Architecture Calendar</span>
                  <span className="material-symbols-outlined text-[16px]">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>

            {/* Right Column: Multi-Step Discovery Form */}
            <div className="lg:col-span-8 bg-surface-canvas p-space-xl md:p-space-2xl rounded-xl shadow-sm border border-border-subtle">
              {submitted ? (
                <div className="py-space-3xl flex flex-col items-center text-center max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-success-emerald-bg text-success-emerald flex items-center justify-center mb-space-md">
                    <span className="material-symbols-outlined text-[36px]">
                      check_circle
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-extrabold mb-space-xs">
                    Technical Intake Received
                  </h3>
                  <p className="font-body-md text-body-md text-slate-text-muted leading-relaxed mb-space-xl">
                    Your architecture specifications have been dispatched to our
                    Nairobi engineering queue. Our Lead Solutions Architect will
                    review your requirements and reply within 4 business hours.
                  </p>
                  <div className="bg-surface-subtle p-space-md rounded-lg w-full text-left font-metric-mono text-xs text-slate-text-muted mb-space-xl space-y-1">
                    <div>Reference: NH-INTAKE-{Math.floor(100000 + Math.random() * 900000)}</div>
                    <div>Target Objectives: {selectedObjectives.join(", ")}</div>
                    <div>Timeline: {timeline}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="font-label-md text-label-md text-primary hover:underline"
                  >
                    Submit another specification
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-space-xl">
                  {/* Step 1: Technical Objectives */}
                  <div>
                    <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider block mb-space-2xs">
                      STEP 01
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-sm">
                      Primary Technical Objective
                    </h3>
                    <p className="font-body-sm text-body-sm text-slate-text-muted mb-space-md">
                      Select one or more capabilities you require:
                    </p>
                    <div className="flex flex-wrap gap-space-xs">
                      {[
                        "M-Pesa Daraja 3.0 Gateway",
                        "Enterprise Web Platform",
                        "Technical SEO & Performance",
                        "Cloud & DevOps Migration",
                        "Cross-Platform Mobile App",
                        "Custom API Middleware",
                      ].map((objective) => {
                        const isSelected = selectedObjectives.includes(objective);
                        return (
                          <button
                            key={objective}
                            type="button"
                            onClick={() => toggleObjective(objective)}
                            className={`font-label-md text-label-md px-space-md py-space-xs rounded-lg transition-all border ${
                              isSelected
                                ? "bg-primary-container text-on-primary border-primary-container font-semibold shadow-xs"
                                : "bg-surface text-on-surface-variant border-border-subtle hover:border-primary/40"
                            }`}
                          >
                            {objective}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Credentials */}
                  <div className="pt-space-md border-t border-border-subtle">
                    <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider block mb-space-2xs">
                      STEP 02
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-md">
                      Contact &amp; Organization Credentials
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                      <div>
                        <label className="block font-label-sm text-label-sm text-on-surface font-bold mb-space-2xs">
                          Full Name / Technical Lead *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. David Mwangi"
                          className="w-full bg-surface border border-border-subtle rounded-lg px-space-md py-space-xs text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block font-label-sm text-label-sm text-on-surface font-bold mb-space-2xs">
                          Work Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="david@company.co.ke"
                          className="w-full bg-surface border border-border-subtle rounded-lg px-space-md py-space-xs text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block font-label-sm text-label-sm text-on-surface font-bold mb-space-2xs">
                          Phone Number (WhatsApp / Mobile) *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+254 7..."
                          className="w-full bg-surface border border-border-subtle rounded-lg px-space-md py-space-xs text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block font-label-sm text-label-sm text-on-surface font-bold mb-space-2xs">
                          Company / Organization Name
                        </label>
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="e.g. Mwangi Logistics Ltd"
                          className="w-full bg-surface border border-border-subtle rounded-lg px-space-md py-space-xs text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Project Parameters */}
                  <div className="pt-space-md border-t border-border-subtle">
                    <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider block mb-space-2xs">
                      STEP 03
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-md">
                      Project Parameters
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                      <div>
                        <label className="block font-label-sm text-label-sm text-on-surface font-bold mb-space-2xs">
                          Anticipated Go-Live Timeline
                        </label>
                        <select
                          value={timeline}
                          onChange={(e) => setTimeline(e.target.value)}
                          className="w-full bg-surface border border-border-subtle rounded-lg px-space-md py-space-xs text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                        >
                          <option>Urgent (&lt; 2 Weeks)</option>
                          <option>1 Month</option>
                          <option>2 - 3 Months</option>
                          <option>Flexible / Scoping Phase</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-label-sm text-label-sm text-on-surface font-bold mb-space-2xs">
                          Estimated Budget Bracket (KES)
                        </label>
                        <select
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          className="w-full bg-surface border border-border-subtle rounded-lg px-space-md py-space-xs text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                        >
                          <option>KSh 45,000 - 75,000 (Starter STK)</option>
                          <option>KSh 75,000 - 150,000 (Enterprise Web/Hub)</option>
                          <option>KSh 150,000 - 350,000 (Full Platform)</option>
                          <option>KSh 350,000+ (Banking / Custom)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Technical Specifications */}
                  <div className="pt-space-md border-t border-border-subtle">
                    <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider block mb-space-2xs">
                      STEP 04
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-2xs">
                      Technical Specifications &amp; Architecture Details
                    </h3>
                    <p className="font-body-sm text-body-sm text-slate-text-muted mb-space-sm">
                      Describe your current stack, expected transaction load (TPS),
                      or specific bottlenecks:
                    </p>
                    <textarea
                      rows={4}
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="e.g. We have an existing Next.js frontend and need to integrate Daraja 3.0 STK push with automated callbacks and reconciliation to our PostgreSQL ledger..."
                      className="w-full bg-surface border border-border-subtle rounded-lg p-space-md text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary leading-relaxed"
                    ></textarea>
                  </div>

                  {/* Step 5: Compliance & Submit */}
                  <div className="pt-space-md border-t border-border-subtle flex flex-col gap-space-md">
                    <label className="flex items-start gap-space-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-1 rounded border-border-subtle text-primary focus:ring-primary"
                      />
                      <span className="font-body-sm text-body-sm text-slate-text-muted">
                        I agree to NetHub&apos;s standard Mutual NDA &amp; Data
                        Protection Policy governed under the Kenya Data Protection
                        Act 2019.
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={isSubmitting || !agreeTerms}
                      className="w-full inline-flex items-center justify-center gap-space-xs font-label-md text-label-md text-on-primary bg-primary-container hover:bg-brand-cobalt-hover py-space-md rounded-lg shadow-md transition-all font-bold disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin material-symbols-outlined text-[20px]">
                            progress_activity
                          </span>
                          <span>Encrypting &amp; Dispatching Intake...</span>
                        </>
                      ) : (
                        <>
                          <span>Dispatch Technical Specifications</span>
                          <span className="material-symbols-outlined text-[20px]">
                            arrow_forward
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
