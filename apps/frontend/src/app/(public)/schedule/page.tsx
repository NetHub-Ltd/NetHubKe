"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function SchedulePage() {
  const [selectedTopic, setSelectedTopic] = useState("M-Pesa Daraja 3.0 Architecture");
  const [selectedDate, setSelectedDate] = useState("2026-09-15");
  const [selectedTime, setSelectedTime] = useState("10:00 AM EAT (UTC+3)");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [booked, setBooked] = useState(false);
  const [loading, setLoading] = useState(false);

  const topics = [
    {
      id: "M-Pesa Daraja 3.0 Architecture",
      title: "M-Pesa Daraja 3.0 Architecture",
      desc: "Deep dive into STK push, automated C2B validation, and zero-dropped callback engines.",
    },
    {
      id: "Next.js & Performance Audit",
      title: "Next.js & Performance Audit",
      desc: "Sub-200ms TTFB, 100/100 Core Web Vitals, and edge caching strategies for Kenyan traffic.",
    },
    {
      id: "Cloud Scalability & DevOps",
      title: "Cloud Scalability & DevOps",
      desc: "AWS/GCP Kubernetes/Docker setup, zero-downtime blue/green pipelines, and failover.",
    },
  ];

  const availableTimes = [
    "09:00 AM EAT (UTC+3)",
    "10:00 AM EAT (UTC+3)",
    "11:30 AM EAT (UTC+3)",
    "02:00 PM EAT (UTC+3)",
    "03:30 PM EAT (UTC+3)",
    "05:00 PM EAT (UTC+3)",
  ];

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setBooked(true);
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full bg-surface min-h-[calc(100vh-64px)]">
      {/* Header */}
      <section className="relative w-full bg-surface-canvas overflow-hidden pt-space-3xl pb-space-3xl border-b border-border-subtle">
        <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-xl">
            <div className="inline-flex items-center gap-space-xs bg-brand-cobalt-light px-space-md py-space-2xs rounded-full">
              <span className="font-metric-mono text-metric-mono text-primary font-bold tracking-widest uppercase">
                DIRECT ARCHITECTURAL CONSULTATION
              </span>
            </div>
            <div className="inline-flex items-center gap-space-xs bg-surface-subtle px-space-md py-space-2xs rounded-full text-slate-text-muted">
              <span className="material-symbols-outlined text-[16px] text-primary">
                video_camera_front
              </span>
              <span className="font-metric-mono text-metric-mono uppercase tracking-wider">
                45-Min Google Meet Session • Senior Architect
              </span>
            </div>
          </div>

          <div className="max-w-3xl flex flex-col gap-space-md">
            <h1 className="font-display-xl text-display-xl text-on-surface tracking-tight font-extrabold">
              Book an Enterprise <br className="hidden sm:inline" />
              <span className="text-primary-container">Architecture Review.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-slate-text-muted leading-relaxed">
              Meet directly with our Lead Systems Architect in Westlands, Nairobi
              (or via secure video conference). We will audit your technical stack,
              diagnose bottlenecks, and provide a clear engineering implementation
              roadmap.
            </p>
          </div>
        </div>
      </section>

      {/* Booking Form Grid */}
      <section className="w-full py-space-4xl">
        <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
          {booked ? (
            <div className="max-w-xl mx-auto bg-surface-canvas p-space-2xl rounded-xl shadow-md border border-border-subtle text-center">
              <div className="w-16 h-16 rounded-full bg-success-emerald-bg text-success-emerald flex items-center justify-center mx-auto mb-space-md">
                <span className="material-symbols-outlined text-[36px]">
                  event_available
                </span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold mb-space-xs">
                Architecture Review Confirmed
              </h2>
              <p className="font-body-md text-body-md text-slate-text-muted mb-space-lg">
                Your 45-minute technical review has been scheduled with NetHub&apos;s
                Lead Systems Architect. A Google Meet calendar invite with technical
                briefing notes has been dispatched to{" "}
                <span className="text-on-surface font-bold">{email}</span>.
              </p>
              <div className="bg-surface-subtle p-space-md rounded-lg text-left font-body-sm text-body-sm text-on-surface mb-space-xl space-y-1">
                <div>
                  <span className="text-slate-text-muted">Domain Topic:</span>{" "}
                  <span className="font-semibold">{selectedTopic}</span>
                </div>
                <div>
                  <span className="text-slate-text-muted">Scheduled Date:</span>{" "}
                  <span className="font-semibold">{selectedDate}</span>
                </div>
                <div>
                  <span className="text-slate-text-muted">Time:</span>{" "}
                  <span className="font-semibold">{selectedTime}</span>
                </div>
                <div>
                  <span className="text-slate-text-muted">Host:</span> Senior Solutions
                  Architect (Westlands Office)
                </div>
              </div>
              <div className="flex justify-center gap-space-md">
                <Link
                  href="/"
                  className="font-label-md text-label-md text-on-primary bg-primary-container hover:bg-brand-cobalt-hover px-space-lg py-space-xs rounded-lg shadow-sm font-semibold"
                >
                  Return to Home
                </Link>
                <button
                  type="button"
                  onClick={() => setBooked(false)}
                  className="font-label-md text-label-md text-on-surface bg-surface hover:bg-surface-subtle px-space-lg py-space-xs rounded-lg font-semibold"
                >
                  Schedule Another
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl items-start">
              {/* Left Column: Topic & Date Selection */}
              <div className="lg:col-span-6 flex flex-col gap-space-xl">
                {/* Topic Selector */}
                <div className="bg-surface-canvas p-space-xl rounded-xl shadow-sm border border-border-subtle">
                  <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider block mb-space-xs">
                    STEP 01
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-md">
                    Select Consultation Domain
                  </h3>
                  <div className="flex flex-col gap-space-sm">
                    {topics.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTopic(t.id)}
                        className={`p-space-md rounded-lg border cursor-pointer transition-all ${
                          selectedTopic === t.id
                            ? "border-primary bg-brand-cobalt-light"
                            : "border-border-subtle bg-surface hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-label-md text-label-md text-on-surface font-bold">
                            {t.title}
                          </span>
                          {selectedTopic === t.id && (
                            <span className="material-symbols-outlined text-primary text-[20px]">
                              check_circle
                            </span>
                          )}
                        </div>
                        <p className="font-body-sm text-body-sm text-slate-text-muted">
                          {t.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time Slot Picker */}
                <div className="bg-surface-canvas p-space-xl rounded-xl shadow-sm border border-border-subtle">
                  <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider block mb-space-xs">
                    STEP 02
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-md">
                    Pick a Date &amp; Available Slot
                  </h3>
                  <div className="mb-space-md">
                    <label className="block font-label-sm text-label-sm text-on-surface font-bold mb-space-2xs">
                      Consultation Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-surface border border-border-subtle rounded-lg px-space-md py-space-xs text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface font-bold mb-space-2xs">
                      Available Nairobi Engineering Slots (EAT)
                    </label>
                    <div className="grid grid-cols-2 gap-space-xs">
                      {availableTimes.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`font-metric-mono text-xs py-2 px-3 rounded-lg border text-center transition-all ${
                            selectedTime === time
                              ? "bg-primary text-white border-primary font-bold shadow-xs"
                              : "bg-surface border-border-subtle text-slate-text-muted hover:border-primary/40 hover:text-on-surface"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Contact Information */}
              <div className="lg:col-span-6 bg-surface-canvas p-space-xl md:p-space-2xl rounded-xl shadow-sm border border-border-subtle">
                <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider block mb-space-xs">
                  STEP 03
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-md">
                  Your Lead Credentials
                </h3>

                <form onSubmit={handleBooking} className="flex flex-col gap-space-md">
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface font-bold mb-space-2xs">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Grace Wanjiku"
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
                      placeholder="grace@fintech-kenya.co.ke"
                      className="w-full bg-surface border border-border-subtle rounded-lg px-space-md py-space-xs text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface font-bold mb-space-2xs">
                      Phone Number (Mobile / WhatsApp) *
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
                      Brief Architecture Questions or Context
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="What is your current transaction volume or key challenge?"
                      className="w-full bg-surface border border-border-subtle rounded-lg p-space-md text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary leading-relaxed"
                    ></textarea>
                  </div>

                  <div className="p-space-md bg-surface-subtle rounded-lg text-slate-text-muted font-body-sm text-body-sm flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      verified
                    </span>
                    <span>
                      Confirmed by NetHub&apos;s mutual non-disclosure &amp; data privacy
                      charter.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-space-xs font-label-md text-label-md text-on-primary bg-primary-container hover:bg-brand-cobalt-hover py-space-md rounded-lg shadow-md transition-all font-bold disabled:opacity-50 mt-space-xs"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin material-symbols-outlined text-[20px]">
                          progress_activity
                        </span>
                        <span>Scheduling Architecture Review...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Architecture Session</span>
                        <span className="material-symbols-outlined text-[20px]">
                          arrow_forward
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
