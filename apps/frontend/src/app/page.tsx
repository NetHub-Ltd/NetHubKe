import Link from "next/link";

export default function Homepage() {
  return (
    <div className="flex flex-col w-full bg-surface">
      {/* 1. HERO SECTION */}
      <section className="relative w-full bg-surface-canvas overflow-hidden pt-space-3xl pb-space-4xl">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -top-32 right-0 w-[540px] h-[540px] bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-20 w-[420px] h-[420px] bg-secondary-container/40 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop relative z-10">
          {/* Telemetry Header */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-xl">
            <div className="inline-flex items-center gap-space-xs bg-brand-cobalt-light px-space-md py-space-2xs rounded-full">
              <span className="font-metric-mono text-metric-mono text-primary font-bold tracking-widest uppercase">
                ENTERPRISE SOFTWARE &amp; FINTECH AUTHORITY
              </span>
            </div>
            <div className="inline-flex items-center gap-space-xs bg-surface-subtle px-space-md py-space-2xs rounded-full text-slate-text-muted">
              <span className="material-symbols-outlined text-[16px] text-primary">
                bolt
              </span>
              <span className="font-metric-mono text-metric-mono uppercase tracking-wider">
                Sub-Second STK Push • Sub-200ms Latency
              </span>
            </div>
          </div>

          {/* Headline and Description */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl items-center mb-space-3xl">
            <div className="lg:col-span-8 flex flex-col gap-space-md">
              <h1 className="font-display-xl text-display-xl text-on-surface tracking-tight font-extrabold">
                Engineering Scalable Systems for{" "}
                <span className="text-primary-container">African Market Leaders.</span>
              </h1>
              <p className="font-body-lg text-body-lg text-slate-text-muted max-w-2xl leading-relaxed">
                We build the technical foundations of East Africa&apos;s digital economy:
                high-throughput Daraja 3.0 M-Pesa payment gateways, fault-tolerant
                cloud backends, and sub-200ms web platforms engineered for extreme
                conversion.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-space-md pt-space-md">
                <Link
                  href="/services"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs font-label-md text-label-md text-on-primary bg-primary-container hover:bg-brand-cobalt-hover px-space-xl py-space-sm rounded-lg shadow-md transition-all font-semibold"
                >
                  <span>Explore Engineering Services</span>
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </Link>
                <Link
                  href="/schedule"
                  className="w-full sm:w-auto inline-flex items-center justify-center font-label-md text-label-md text-on-surface bg-surface-canvas hover:bg-surface-subtle px-space-xl py-space-sm rounded-lg shadow-sm border border-border-subtle transition-all font-semibold"
                >
                  <span>Book Architecture Review</span>
                </Link>
              </div>
            </div>

            {/* Quick Metrics Terminal */}
            <div className="lg:col-span-4 bg-surface p-space-xl rounded-xl border border-border-subtle shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between pb-space-xs border-b border-border-subtle">
                <span className="font-metric-mono text-metric-mono text-primary font-bold">
                  PRODUCTION SLA TELEMETRY
                </span>
                <span className="font-metric-mono text-[11px] text-success-emerald bg-success-emerald-bg px-2 py-0.5 rounded-full font-bold">
                  LIVE
                </span>
              </div>
              <div className="space-y-space-sm">
                <div>
                  <div className="flex justify-between font-label-sm text-label-sm text-slate-text-muted mb-1">
                    <span>M-Pesa STK Push Avg Latency</span>
                    <span className="text-on-surface font-bold">450ms</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[95%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-label-sm text-label-sm text-slate-text-muted mb-1">
                    <span>Gateway Availability SLA</span>
                    <span className="text-on-surface font-bold">99.99%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-success-emerald h-full w-[99.99%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-label-sm text-label-sm text-slate-text-muted mb-1">
                    <span>Core Web Vitals Score</span>
                    <span className="text-on-surface font-bold">100 / 100</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[100%]"></div>
                  </div>
                </div>
              </div>
              <p className="text-[12px] text-slate-text-muted pt-space-xs border-t border-border-subtle">
                Westlands Nairobi Node • Safaricom G2/G3 Daraja Switch
              </p>
            </div>
          </div>

          {/* 4 Trust Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md pt-space-md border-t border-border-subtle">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[28px]">
                account_balance_wallet
              </span>
              <div>
                <span className="font-label-sm text-label-sm text-on-surface font-bold block">
                  Daraja 3.0 API
                </span>
                <span className="font-body-sm text-body-sm text-slate-text-muted">
                  Certified Partner Node
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-success-emerald text-[28px]">
                verified_user
              </span>
              <div>
                <span className="font-label-sm text-label-sm text-on-surface font-bold block">
                  PCI-DSS Level 1
                </span>
                <span className="font-body-sm text-body-sm text-slate-text-muted">
                  Encrypted Financial Rails
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[28px]">
                speed
              </span>
              <div>
                <span className="font-label-sm text-label-sm text-on-surface font-bold block">
                  Sub-200ms TTFB
                </span>
                <span className="font-body-sm text-body-sm text-slate-text-muted">
                  Next.js Edge Platforms
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-success-emerald text-[28px]">
                shield
              </span>
              <div>
                <span className="font-label-sm text-label-sm text-on-surface font-bold block">
                  Kenya DPA 2019
                </span>
                <span className="font-body-sm text-body-sm text-slate-text-muted">
                  Data Protection Compliant
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE CAPABILITIES BENTO */}
      <section className="w-full bg-surface py-space-4xl">
        <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg mb-space-2xl">
            <div>
              <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
                SYSTEM CAPABILITIES
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight mt-space-xs">
                Built for High Concurrency &amp; Reliability
              </h2>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-space-xs text-primary font-label-md text-label-md font-bold hover:underline"
            >
              <span>View Full Service Catalog</span>
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-xl">
            {/* Card 1 */}
            <div className="bg-surface-canvas p-space-xl rounded-xl shadow-sm border border-border-subtle flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-lg bg-brand-cobalt-light text-primary flex items-center justify-center mb-space-md">
                  <span className="material-symbols-outlined text-[28px]">
                    account_balance_wallet
                  </span>
                </div>
                <span className="font-metric-mono text-metric-mono text-primary bg-brand-cobalt-light px-space-xs py-space-2xs rounded-full font-bold uppercase">
                  FINTECH
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold mt-space-sm mb-space-xs">
                  M-Pesa Daraja 3.0 Switch
                </h3>
                <p className="font-body-md text-body-md text-slate-text-muted leading-relaxed">
                  Sub-second STK Push, instant C2B reconciliation, automated B2C
                  payouts, and idempotent queue handling with zero lost transactions.
                </p>
              </div>
              <Link
                href="/service/mpesa-integration"
                className="mt-space-lg pt-space-md border-t border-border-subtle flex items-center justify-between text-primary font-label-md text-label-md font-bold hover:underline"
              >
                <span>Explore Daraja Architecture</span>
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </Link>
            </div>

            {/* Card 2 */}
            <div className="bg-surface-canvas p-space-xl rounded-xl shadow-sm border border-border-subtle flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-lg bg-surface-container-high text-primary flex items-center justify-center mb-space-md">
                  <span className="material-symbols-outlined text-[28px]">
                    web
                  </span>
                </div>
                <span className="font-metric-mono text-metric-mono text-primary bg-brand-cobalt-light px-space-xs py-space-2xs rounded-full font-bold uppercase">
                  CLOUD SYSTEMS
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold mt-space-sm mb-space-xs">
                  Enterprise Web Platforms
                </h3>
                <p className="font-body-md text-body-md text-slate-text-muted leading-relaxed">
                  SSR architectures powered by Next.js and Go-Fiber. 100/100 Core Web
                  Vitals, sub-200ms latency, and automated zero-downtime deployment.
                </p>
              </div>
              <Link
                href="/services"
                className="mt-space-lg pt-space-md border-t border-border-subtle flex items-center justify-between text-primary font-label-md text-label-md font-bold hover:underline"
              >
                <span>View Web Systems</span>
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </Link>
            </div>

            {/* Card 3 */}
            <div className="bg-surface-canvas p-space-xl rounded-xl shadow-sm border border-border-subtle flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-lg bg-success-emerald-bg text-tertiary flex items-center justify-center mb-space-md">
                  <span className="material-symbols-outlined text-[28px]">
                    search_insights
                  </span>
                </div>
                <span className="font-metric-mono text-metric-mono text-tertiary bg-success-emerald-bg px-space-xs py-space-2xs rounded-full font-bold uppercase">
                  SEO ENGINE
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold mt-space-sm mb-space-xs">
                  Technical SEO &amp; CWV
                </h3>
                <p className="font-body-md text-body-md text-slate-text-muted leading-relaxed">
                  Dynamic JSON-LD schema graphs, structured canonical hierarchies,
                  and sub-1.2s LCP guarantees to dominate Kenyan search rankings.
                </p>
              </div>
              <Link
                href="/services"
                className="mt-space-lg pt-space-md border-t border-border-subtle flex items-center justify-between text-primary font-label-md text-label-md font-bold hover:underline"
              >
                <span>Explore Technical SEO</span>
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CTA BANNER */}
      <section className="w-full bg-surface-canvas py-space-4xl">
        <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="relative bg-surface-muted p-space-2xl md:p-space-3xl rounded-xl shadow-sm overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-space-2xl">
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
