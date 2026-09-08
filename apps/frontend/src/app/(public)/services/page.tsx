"use client";

import React, { useState } from "react";
import Link from "next/link";

interface ServiceItem {
  id: string;
  category: "fintech" | "cloud" | "seo" | "middleware";
  badge: string;
  price: string;
  priceSub: string;
  title: string;
  description: string;
  techStack: string[];
  features: string[];
  link: string;
  buttonText: string;
}

const serviceItems: ServiceItem[] = [
  {
    id: "mpesa",
    category: "fintech",
    badge: "Safaricom Certified",
    price: "KSh 45,000",
    priceSub: "Base Architecture",
    title: "M-Pesa Daraja 3.0 Integration",
    description:
      "Production-ready payment infrastructure with sub-second STK Push, automated C2B reconciliation, B2C bulk disbursements, and encrypted callback handling.",
    techStack: ["Next.js", "Go-Fiber", "Redis", "Daraja 3.0"],
    features: [
      "Sub-second STK Push with Instant Re-Query Fallback",
      "Automated C2B Validation & Reconciliation",
      "B2C Bulk Disbursement with Instant Callbacks",
      "Direct Safaricom Production Queue Onboarding",
    ],
    link: "/service/mpesa-integration",
    buttonText: "Explore Architecture",
  },
  {
    id: "web-systems",
    category: "cloud",
    badge: "Sub-200ms TTFB",
    price: "KSh 85,000",
    priceSub: "Full Deployment",
    title: "Enterprise Web Systems",
    description:
      "Next-generation web applications built for extreme concurrency, zero-downtime deployment pipelines, and maximum SEO crawl efficiency.",
    techStack: ["Next.js 15", "TypeScript", "Tailwind", "Cloudflare"],
    features: [
      "Server-Side Rendering (SSR) & Dynamic ISR",
      "100/100 Core Web Vitals on Mobile & Desktop",
      "Edge-Cached API Responses via Global CDN",
      "Automated Zero-Downtime GitHub Actions CI/CD",
    ],
    link: "/contact",
    buttonText: "Explore Architecture",
  },
  {
    id: "seo",
    category: "seo",
    badge: "SERP Dominance",
    price: "KSh 35,000",
    priceSub: "Audit & Execution",
    title: "Technical SEO & Core Web Vitals",
    description:
      "Engineering-led search optimization: dynamic JSON-LD schema generation, sub-100ms Core Web Vitals, and localized canonical structuring.",
    techStack: ["Schema.org", "Lighthouse CI", "Edge SEO", "Next/Dynamic"],
    features: [
      "Sub-1.2s LCP Guarantee with Critical CSS Inlining",
      "Dynamic JSON-LD Schema Graph Generation",
      "Hreflang & Canonical Architecture for East Africa",
      "Automated Crawl-Budget & Server Log Optimization",
    ],
    link: "/contact",
    buttonText: "Explore Architecture",
  },
  {
    id: "mobile",
    category: "cloud",
    badge: "Flutter / Native",
    price: "KSh 120,000",
    priceSub: "Cross-Platform",
    title: "Cross-Platform Mobile Applications",
    description:
      "High-performance Android and iOS applications with offline-first synchronization, native biometric authentication, and integrated M-Pesa SDKs.",
    techStack: ["Flutter", "Kotlin", "Swift", "SQLite"],
    features: [
      "Offline-First Data Sync with Conflict Resolution",
      "Biometric Authentication (Fingerprint / FaceID)",
      "Native In-App Daraja STK Push Initiation",
      "Automated Play Store & App Store Pipeline",
    ],
    link: "/contact",
    buttonText: "Explore Architecture",
  },
  {
    id: "ecommerce",
    category: "middleware",
    badge: "High-Concurrency",
    price: "KSh 95,000",
    priceSub: "Turnkey Solution",
    title: "E-Commerce Core & Middleware",
    description:
      "Headless commerce platforms engineered for peak traffic events: flash sales, real-time inventory locking, and multi-currency payment routing.",
    techStack: ["Medusa.js", "PostgreSQL", "Redis Queue", "Stripe/M-Pesa"],
    features: [
      "Distributed Inventory Locking (Zero Overselling)",
      "Automated KRA eTIMS Tax Compliance Middleware",
      "Multi-Currency Dynamic Conversion & Settling",
      "Sub-50ms Cart Calculations via In-Memory Cache",
    ],
    link: "/contact",
    buttonText: "Explore Architecture",
  },
  {
    id: "devops",
    category: "cloud",
    badge: "Zero-Downtime",
    price: "KSh 60,000",
    priceSub: "Cloud Architecture",
    title: "Cloud Infrastructure & DevOps",
    description:
      "Enterprise-grade cloud architectures on AWS and GCP. Automated Terraform provisioning, Docker containerization, and 24/7 observability.",
    techStack: ["Terraform", "Docker", "AWS ECS", "Prometheus"],
    features: [
      "Infrastructure-as-Code (IaC) with Auto-Scaling",
      "Zero-Downtime Blue/Green Deployment Pipelines",
      "Automated Daily Multi-Region Snapshot Backups",
      "24/7 Sentry & Datadog SLA Telemetry Dashboards",
    ],
    link: "/contact",
    buttonText: "Explore Architecture",
  },
];

type CategoryFilter = "all" | "fintech" | "cloud" | "seo" | "middleware";

export default function ServicesPage() {
  const [filter, setFilter] = useState<CategoryFilter>("all");

  const filteredServices =
    filter === "all"
      ? serviceItems
      : serviceItems.filter((item) => item.category === filter);

  return (
    <div className="flex flex-col w-full bg-surface">
      {/* Hero Section */}
      <section className="relative w-full bg-surface-canvas overflow-hidden pt-space-3xl pb-space-4xl">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -top-32 right-0 w-[540px] h-[540px] bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-20 w-[420px] h-[420px] bg-secondary-container/40 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop relative z-10">
          {/* Breadcrumb & Telemetry Marker */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-xl">
            <div className="inline-flex items-center gap-space-xs bg-brand-cobalt-light px-space-md py-space-2xs rounded-full">
              <span className="font-metric-mono text-metric-mono text-primary font-bold tracking-widest uppercase">
                ENTERPRISE ENGINEERING CATALOG
              </span>
            </div>
            <div className="inline-flex items-center gap-space-xs bg-surface-subtle px-space-md py-space-2xs rounded-full text-slate-text-muted">
              <span className="material-symbols-outlined text-[16px] text-primary">
                code
              </span>
              <span className="font-metric-mono text-metric-mono uppercase tracking-wider">
                Nairobi Hub • Active Production Queue
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-space-md mb-space-2xl max-w-3xl">
            <h1 className="font-display-xl text-display-xl text-on-surface tracking-tight font-extrabold">
              Scalable Systems for <br className="hidden sm:inline" />
              <span className="text-primary-container">African Market Leaders.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-slate-text-muted max-w-2xl leading-relaxed">
              From high-throughput fintech payment switches handling millions in
              daily volume to ultra-fast web platforms with sub-200ms TTFB, we
              engineer the digital infrastructure powering East Africa&apos;s most
              ambitious enterprises.
            </p>
          </div>

          {/* Technical Confidence Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md pt-space-md border-t border-border-subtle">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-success-emerald text-[24px]">
                verified
              </span>
              <div>
                <span className="font-label-sm text-label-sm text-on-surface font-bold block">
                  99.9% Production SLA
                </span>
                <span className="font-body-sm text-body-sm text-slate-text-muted">
                  Guaranteed Uptime Rails
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[24px]">
                security
              </span>
              <div>
                <span className="font-label-sm text-label-sm text-on-surface font-bold block">
                  PCI-DSS Level 1
                </span>
                <span className="font-body-sm text-body-sm text-slate-text-muted">
                  Compliant Architecture
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-tertiary-container text-[24px]">
                speed
              </span>
              <div>
                <span className="font-label-sm text-label-sm text-on-surface font-bold block">
                  Sub-200ms
                </span>
                <span className="font-body-sm text-body-sm text-slate-text-muted">
                  East Africa Latency
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Category Filter Bar */}
      <section className="sticky top-16 z-40 bg-surface/95 backdrop-blur-md border-b border-border-subtle py-space-sm">
        <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-space-2xs">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`font-label-md text-label-md px-space-md py-space-xs rounded-lg transition-all whitespace-nowrap ${
                filter === "all"
                  ? "bg-primary-container text-on-primary font-bold shadow-xs"
                  : "bg-surface-canvas text-on-surface-variant hover:bg-surface-subtle"
              }`}
            >
              All Capabilities
            </button>
            <button
              type="button"
              onClick={() => setFilter("fintech")}
              className={`font-label-md text-label-md px-space-md py-space-xs rounded-lg transition-all whitespace-nowrap ${
                filter === "fintech"
                  ? "bg-primary-container text-on-primary font-bold shadow-xs"
                  : "bg-surface-canvas text-on-surface-variant hover:bg-surface-subtle"
              }`}
            >
              Fintech &amp; Payments
            </button>
            <button
              type="button"
              onClick={() => setFilter("cloud")}
              className={`font-label-md text-label-md px-space-md py-space-xs rounded-lg transition-all whitespace-nowrap ${
                filter === "cloud"
                  ? "bg-primary-container text-on-primary font-bold shadow-xs"
                  : "bg-surface-canvas text-on-surface-variant hover:bg-surface-subtle"
              }`}
            >
              Cloud Platforms
            </button>
            <button
              type="button"
              onClick={() => setFilter("seo")}
              className={`font-label-md text-label-md px-space-md py-space-xs rounded-lg transition-all whitespace-nowrap ${
                filter === "seo"
                  ? "bg-primary-container text-on-primary font-bold shadow-xs"
                  : "bg-surface-canvas text-on-surface-variant hover:bg-surface-subtle"
              }`}
            >
              Performance &amp; SEO
            </button>
            <button
              type="button"
              onClick={() => setFilter("middleware")}
              className={`font-label-md text-label-md px-space-md py-space-xs rounded-lg transition-all whitespace-nowrap ${
                filter === "middleware"
                  ? "bg-primary-container text-on-primary font-bold shadow-xs"
                  : "bg-surface-canvas text-on-surface-variant hover:bg-surface-subtle"
              }`}
            >
              Custom Middleware
            </button>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="w-full bg-surface py-space-4xl">
        <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-xl">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-surface-canvas rounded-xl p-space-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-transparent hover:border-primary/20"
              >
                <div>
                  {/* Top Badge & Pricing Row */}
                  <div className="flex items-center justify-between gap-space-sm mb-space-md">
                    <span className="font-metric-mono text-metric-mono text-primary bg-brand-cobalt-light px-space-sm py-space-2xs rounded-full font-bold uppercase tracking-wider">
                      {service.badge}
                    </span>
                    <div className="text-right">
                      <span className="font-label-sm text-label-sm text-slate-text-muted block">
                        {service.priceSub}
                      </span>
                      <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold">
                        {service.price}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-space-xs tracking-tight">
                    {service.title}
                  </h3>
                  <p className="font-body-md text-body-md text-slate-text-muted mb-space-lg leading-relaxed">
                    {service.description}
                  </p>

                  {/* Tech Stack Pills */}
                  <div className="flex flex-wrap gap-space-2xs mb-space-lg">
                    {service.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="font-metric-mono text-metric-mono text-on-surface-variant bg-surface-subtle px-space-xs py-space-2xs rounded-md"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Architectural Feature Checklist */}
                  <ul className="flex flex-col gap-space-xs mb-space-xl pt-space-sm border-t border-border-subtle">
                    {service.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-start gap-space-xs text-body-sm font-body-sm text-on-surface"
                      >
                        <span className="material-symbols-outlined text-success-emerald text-[18px] shrink-0 mt-0.5">
                          check_circle
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Primary Action Button */}
                <Link
                  href={service.link}
                  className="w-full inline-flex items-center justify-center gap-space-xs font-label-md text-label-md text-on-primary bg-primary-container hover:bg-brand-cobalt-hover py-space-sm rounded-lg shadow-sm transition-all font-semibold"
                >
                  <span>{service.buttonText}</span>
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* High-Conversion Architecture Review CTA Banner */}
      <section className="w-full bg-surface-canvas py-space-4xl">
        <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="relative bg-surface-muted p-space-2xl md:p-space-3xl rounded-xl shadow-sm overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-space-2xl">
            <div className="relative z-10 max-w-xl flex flex-col gap-space-sm text-center lg:text-left">
              <span className="font-metric-mono text-metric-mono text-primary font-bold uppercase tracking-wider">
                ARCHITECTURE ASSURANCE
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
                Need a Custom Enterprise Architecture?
              </h2>
              <p className="font-body-md text-body-md text-slate-text-muted">
                Our senior systems architects provide comprehensive codebase
                reviews, M-Pesa gateway audits, and scalability roadmaps
                tailored to your infrastructure.
              </p>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-space-md shrink-0 w-full sm:w-auto">
              <Link
                className="w-full sm:w-auto inline-flex items-center justify-center font-label-md text-label-md text-on-primary bg-primary-container hover:bg-brand-cobalt-hover px-space-xl py-space-sm rounded-lg shadow-md transition-all font-semibold"
                href="/schedule"
              >
                <span>Book 45-Min Technical Review</span>
                <span className="material-symbols-outlined text-[18px] ml-space-xs">
                  calendar_today
                </span>
              </Link>
              <Link
                className="w-full sm:w-auto inline-flex items-center justify-center font-label-md text-label-md text-on-surface bg-surface-canvas hover:bg-surface-subtle px-space-xl py-space-sm rounded-lg shadow-sm transition-all font-semibold"
                href="/contact"
              >
                <span>Direct Project Intake</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
