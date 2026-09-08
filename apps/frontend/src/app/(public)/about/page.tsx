"use client";

import React, { useState } from "react";
import Link from "next/link";

const faqs = [
  {
    id: 1,
    question: "Where is NetHub Kenya located?",
    answer:
      "NetHub is a premier software engineering agency headquartered in Nairobi, Kenya. Our physical presence in the East African tech hub allows us to provide localized M-Pesa API expertise and on-site strategic consulting for regional enterprises.",
  },
  {
    id: 2,
    question: "Does NetHub provide technical support after deployment?",
    answer:
      "Yes. We offer enterprise-grade Service Level Agreements (SLAs) including 24/7 monitoring and technical support for all M-Pesa gateways and custom cloud infrastructure to ensure zero business downtime.",
  },
  {
    id: 3,
    question: "What industries does NetHub specialize in?",
    answer:
      "We specialize in Fintech, E-commerce, and Logistics. Our engineering team focuses on building high-concurrency systems that handle thousands of transactions per second seamlessly.",
  },
];

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(2);

  const toggleFaq = (id: number) => {
    setOpenFaq((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-col w-full bg-surface">
      {/* Top Mission Hero Section */}
      <section className="relative w-full bg-surface-canvas overflow-hidden pt-space-3xl pb-space-4xl">
        {/* Ambient high-tech background pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -top-32 right-0 w-[540px] h-[540px] bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-20 w-[420px] h-[420px] bg-secondary-container/40 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop relative z-10">
          {/* Breadcrumb & Telemetry Marker */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-xl">
            <div className="inline-flex items-center gap-space-xs bg-brand-cobalt-light px-space-md py-space-2xs rounded-full">
              <span className="font-metric-mono text-metric-mono text-primary font-bold tracking-widest uppercase">
                THE NETHUB MISSION
              </span>
            </div>
            <div className="inline-flex items-center gap-space-xs bg-surface-subtle px-space-md py-space-2xs rounded-full text-slate-text-muted">
              <span className="material-symbols-outlined text-[16px] text-primary">
                terminal
              </span>
              <span className="font-metric-mono text-metric-mono uppercase tracking-wider">
                Nairobi, KE • Est. 2024
              </span>
            </div>
          </div>

          {/* Main Heading Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start mb-space-3xl">
            <div className="lg:col-span-8 flex flex-col gap-space-md">
              <h1 className="font-display-xl text-display-xl text-on-surface tracking-tight font-extrabold">
                Engineering the Future of <br className="hidden sm:inline" />
                <span className="text-primary-container">Kenyan Digital Commerce.</span>
              </h1>
              <p className="font-body-lg text-body-lg text-slate-text-muted max-w-2xl leading-relaxed">
                NetHub was established to solve the &quot;Fragility Gap&quot; in East
                Africa&apos;s tech landscape. We combine global engineering
                standards—clean code, scalable architecture, and ISO-grade
                security—with a deep, localized understanding of the M-Pesa
                ecosystem.
              </p>
            </div>

            {/* Executive Citation Plaque */}
            <div className="lg:col-span-4 bg-surface-subtle p-space-xl rounded-xl shadow-sm relative">
              <div className="flex items-center gap-space-xs mb-space-sm">
                <span className="material-symbols-outlined text-primary text-[28px]">
                  format_quote
                </span>
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold">
                  Executive Thesis
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface italic font-medium leading-relaxed mb-space-md">
                &quot;We don&apos;t just build software; we build the technical
                resilience required for Kenyan brands to scale from local startups to
                regional leaders.&quot;
              </p>
              <div className="flex items-center gap-space-sm pt-space-xs">
                <div className="w-2 h-2 rounded-full bg-success-emerald"></div>
                <span className="font-metric-mono text-metric-mono text-slate-text-muted">
                  Core Infrastructure Directorate
                </span>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
            <div className="bg-surface p-space-lg rounded-xl shadow-sm flex flex-col justify-between group hover:bg-surface-canvas transition-all">
              <div className="flex items-center justify-between mb-space-md">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  hub
                </span>
                <span className="font-metric-mono text-metric-mono text-metric-badge-blue-text bg-metric-badge-blue-bg px-space-xs py-space-2xs rounded-full">
                  FINTECH
                </span>
              </div>
              <div>
                <div className="font-display-lg text-display-lg text-on-surface font-extrabold tracking-tight">
                  50+
                </div>
                <p className="font-label-md text-label-md text-slate-text-muted mt-space-2xs">
                  High-Scale Integrations
                </p>
              </div>
            </div>

            <div className="bg-surface p-space-lg rounded-xl shadow-sm flex flex-col justify-between group hover:bg-surface-canvas transition-all">
              <div className="flex items-center justify-between mb-space-md">
                <span className="material-symbols-outlined text-success-emerald text-[24px]">
                  verified
                </span>
                <span className="font-metric-mono text-metric-mono text-tertiary bg-success-emerald-bg px-space-xs py-space-2xs rounded-full">
                  SLA TIER
                </span>
              </div>
              <div>
                <div className="font-display-lg text-display-lg text-on-surface font-extrabold tracking-tight">
                  99.9%
                </div>
                <p className="font-label-md text-label-md text-slate-text-muted mt-space-2xs">
                  SLA Guaranteed Uptime
                </p>
              </div>
            </div>

            <div className="bg-surface p-space-lg rounded-xl shadow-sm flex flex-col justify-between group hover:bg-surface-canvas transition-all">
              <div className="flex items-center justify-between mb-space-md">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  groups
                </span>
                <span className="font-metric-mono text-metric-mono text-metric-badge-blue-text bg-metric-badge-blue-bg px-space-xs py-space-2xs rounded-full">
                  CORE SQUAD
                </span>
              </div>
              <div>
                <div className="font-display-lg text-display-lg text-on-surface font-extrabold tracking-tight">
                  12+
                </div>
                <p className="font-label-md text-label-md text-slate-text-muted mt-space-2xs">
                  Engineering Experts
                </p>
              </div>
            </div>

            <div className="bg-surface p-space-lg rounded-xl shadow-sm flex flex-col justify-between group hover:bg-surface-canvas transition-all">
              <div className="flex items-center justify-between mb-space-md">
                <span className="material-symbols-outlined text-tertiary-container text-[24px]">
                  trending_up
                </span>
                <span className="font-metric-mono text-metric-mono text-tertiary bg-success-emerald-bg px-space-xs py-space-2xs rounded-full">
                  DELIVERY
                </span>
              </div>
              <div>
                <div className="font-display-lg text-display-lg text-on-surface font-extrabold tracking-tight">
                  100%
                </div>
                <p className="font-label-md text-label-md text-slate-text-muted mt-space-2xs">
                  Client ROI Success
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architecture Pillars Section */}
      <section className="w-full bg-surface py-space-4xl">
        <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg mb-space-2xl">
            <div className="max-w-xl">
              <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
                FOUNDATIONAL FRAMEWORKS
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight mt-space-xs">
                Our Core Architecture
              </h2>
              <p className="font-body-md text-body-md text-slate-text-muted mt-space-xs">
                We approach every project with an architectural mindset, ensuring
                long-term viability and immediate conversion gains.
              </p>
            </div>
            <div className="shrink-0">
              <div className="inline-flex items-center gap-space-xs bg-surface-canvas px-space-md py-space-xs rounded-lg shadow-sm text-slate-text-muted font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  security
                </span>
                <span>Kenya DPA 2019 &amp; ISO/IEC Standards</span>
              </div>
            </div>
          </div>

          {/* Architecture Pillars 4-Card Bento */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-lg">
            {/* Pillar 1 */}
            <div className="bg-surface-canvas p-space-xl rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-lg bg-brand-cobalt-light flex items-center justify-center text-primary-container mb-space-lg">
                  <span className="material-symbols-outlined text-[28px]">
                    account_balance_wallet
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-xs">
                  Localized Fintech Mastery
                </h3>
                <p className="font-body-sm text-body-sm text-slate-text-muted leading-relaxed">
                  Specialized integration of M-Pesa G2/G3 APIs, enabling instant STK
                  push and automated B2C disbursement with bank-grade security.
                </p>
              </div>
              <div className="mt-space-lg pt-space-md flex items-center gap-space-xs text-primary font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                <span>Sub-second STK Push</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-surface-canvas p-space-xl rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary mb-space-lg">
                  <span className="material-symbols-outlined text-[28px]">speed</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-xs">
                  Engineering for Performance
                </h3>
                <p className="font-body-sm text-body-sm text-slate-text-muted leading-relaxed">
                  Using Next.js and Go-Fiber to deliver sub-200ms API responses,
                  critical for user retention in Kenya&apos;s mobile-first market.
                </p>
              </div>
              <div className="mt-space-lg pt-space-md flex items-center gap-space-xs text-primary font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[18px]">timer</span>
                <span>Sub-200ms Telemetry</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-surface-canvas p-space-xl rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary-container mb-space-lg">
                  <span className="material-symbols-outlined text-[28px]">
                    search_insights
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-xs">
                  Technical Search Authority
                </h3>
                <p className="font-body-sm text-body-sm text-slate-text-muted leading-relaxed">
                  Beyond keywords—we engineer websites with perfect Core Web Vitals
                  and Schema architectures to dominate Nairobi&apos;s search results.
                </p>
              </div>
              <div className="mt-space-lg pt-space-md flex items-center gap-space-xs text-primary font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[18px]">
                  award_star
                </span>
                <span>100/100 Core Web Vitals</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="bg-surface-canvas p-space-xl rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-lg bg-success-emerald-bg flex items-center justify-center text-tertiary mb-space-lg">
                  <span className="material-symbols-outlined text-[28px]">gavel</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-xs">
                  Enterprise Engineering
                </h3>
                <p className="font-body-sm text-body-sm text-slate-text-muted leading-relaxed">
                  Strict Adherence to clean code &amp; Data Protection Standards
                  (Kenya DPA 2019) paired with resilient fallback mechanisms.
                </p>
              </div>
              <div className="mt-space-lg pt-space-md flex items-center gap-space-xs text-tertiary font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[18px]">
                  verified_user
                </span>
                <span>Kenya DPA Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Physical Presence & Headquarters Visual Section */}
      <section className="w-full bg-surface-canvas py-space-4xl">
        <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl items-center">
            {/* Physical Location Information */}
            <div className="lg:col-span-6 flex flex-col gap-space-lg">
              <div>
                <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
                  REGIONAL NEXUS
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight mt-space-xs">
                  Headquartered in Nairobi, Kenya
                </h2>
                <p className="font-body-lg text-body-lg text-slate-text-muted mt-space-sm leading-relaxed">
                  The Mirage Towers, Mezzanine 2, Chiromo Rd, Westlands, Nairobi.
                  Est. 2024.
                </p>
              </div>
              <div className="bg-surface-subtle p-space-lg rounded-xl shadow-sm flex flex-col gap-space-sm">
                <div className="flex items-center gap-space-xs text-primary font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[22px]">
                    corporate_fare
                  </span>
                  <span>Direct Strategic Presence</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                  Our physical presence in the East African tech hub allows us to
                  provide localized M-Pesa API expertise and on-site strategic
                  consulting for regional enterprises.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-space-md pt-space-xs">
                <div className="bg-surface p-space-md rounded-lg shadow-sm">
                  <span className="font-metric-mono text-metric-mono text-slate-text-muted block mb-space-2xs">
                    COORDINATES
                  </span>
                  <span className="font-label-md text-label-md text-on-surface font-bold">
                    1.2676° S, 36.8044° E
                  </span>
                </div>
                <div className="bg-surface p-space-md rounded-lg shadow-sm">
                  <span className="font-metric-mono text-metric-mono text-slate-text-muted block mb-space-2xs">
                    TIMEZONE
                  </span>
                  <span className="font-label-md text-label-md text-on-surface font-bold">
                    East Africa Time (UTC+3)
                  </span>
                </div>
              </div>
            </div>

            {/* Headquarters Location Imagery / Visual Showcase */}
            <div className="lg:col-span-6 flex flex-col gap-space-md">
              <div className="relative w-full h-[360px] rounded-xl overflow-hidden shadow-lg">
                <img
                  className="w-full h-full object-cover"
                  alt="A modern glass-clad architectural corporate skyscraper in Westlands Nairobi representing The Mirage Towers under bright blue daytime skies."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMoE7to2j6jLOus0e2J_B3JQZQHQIGlYTuRXlqriicqnaw3VcN0vSei-s0y2CsZUfYE0lioEfpHFNTZjHfF5rLd8TxqbjGws2HAVV6Ogla1B2q5EuUYX0MpzhLu86tbNkrlTGQN0-tuyk8nah08geFIT5ek8AfgcY7rS33qZtaKZc34aAHUua98Po4YKbdsfp5j597W7STmyM7OcOPQIHN4P4mPLZKXswWMbA43E68iPFEKUCqLkQD"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-surface-canvas/90 backdrop-blur-md p-space-md rounded-lg shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      pin_drop
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface font-bold">
                      The Mirage Towers • Westlands, Nairobi
                    </span>
                  </div>
                  <span className="font-metric-mono text-metric-mono text-success-emerald bg-success-emerald-bg px-space-xs py-space-2xs rounded-full">
                    ACTIVE NODE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Decision-Maker Insights / FAQ Section */}
      <section className="w-full bg-surface-subtle py-space-4xl">
        <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="max-w-2xl mb-space-2xl">
            <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
              TECHNICAL DIALOGUE
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight mt-space-xs">
              Expert Insights
            </h2>
            <p className="font-body-md text-body-md text-slate-text-muted mt-space-xs">
              Clear answers for technical decision-makers.
            </p>
          </div>

          {/* Custom High-Impact Technical Accordion */}
          <div className="flex flex-col gap-space-md max-w-3xl">
            {faqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-surface-canvas rounded-xl shadow-sm overflow-hidden"
                >
                  <button
                    className="w-full text-left p-space-xl flex items-center justify-between gap-space-md hover:bg-surface-subtle/50 transition-colors"
                    onClick={() => toggleFaq(faq.id)}
                    type="button"
                  >
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      {faq.question}
                    </span>
                    <span
                      className={`material-symbols-outlined text-primary text-[24px] transform transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-space-xl pb-space-xl pt-0 text-slate-text-muted font-body-md text-body-md leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* High-Conversion Bottom CTA Banner */}
      <section className="w-full bg-surface-canvas py-space-4xl">
        <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="relative bg-surface-muted p-space-2xl md:p-space-3xl rounded-xl shadow-sm overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-space-2xl">
            {/* Abstract Tech Wave Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <svg
                className="w-full h-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 1000 400"
              >
                <path
                  className="text-primary-container"
                  d="M0,200 C300,300 700,100 1000,200 L1000,400 L0,400 Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div className="relative z-10 max-w-xl flex flex-col gap-space-sm text-center lg:text-left">
              <span className="font-metric-mono text-metric-mono text-primary font-bold uppercase tracking-wider">
                PROJECT ACCELERATION
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
                Ready to build resilient digital infrastructure?
              </h2>
              <p className="font-body-md text-body-md text-slate-text-muted">
                Partner with Nairobi&apos;s premier enterprise engineering team to
                architect M-Pesa payment gateways, high-throughput cloud
                backends, and sub-200ms applications.
              </p>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-space-md shrink-0 w-full sm:w-auto">
              <Link
                className="w-full sm:w-auto inline-flex items-center justify-center font-label-md text-label-md text-on-primary bg-primary-container hover:bg-brand-cobalt-hover px-space-xl py-space-sm rounded-lg shadow-md transition-all font-semibold"
                href="/contact"
              >
                <span>Start Consultation</span>
                <span className="material-symbols-outlined text-[18px] ml-space-xs">
                  arrow_forward
                </span>
              </Link>
              <Link
                className="w-full sm:w-auto inline-flex items-center justify-center font-label-md text-label-md text-on-surface bg-surface-canvas hover:bg-surface-subtle px-space-xl py-space-sm rounded-lg shadow-sm transition-all font-semibold"
                href="/schedule"
              >
                <span>Schedule Architecture Review</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
