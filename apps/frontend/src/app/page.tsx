import Link from "next/link";

const pillars = [
  {
    title: "Connectivity that holds",
    body: "Networks and links designed for uptime, clarity, and operations teams that need to trust the path.",
  },
  {
    title: "Identity without lock-in",
    body: "Sign in with your organization’s IdP. Every product uses the same secure integration to NetHubKe.",
  },
  {
    title: "Products that share a spine",
    body: "Website, Tawala, NetPay, and future clients resolve the same user—no one-off auth forks.",
  },
];

const services = [
  {
    name: "Enterprise connectivity",
    blurb: "Last-mile and backbone options tailored to how your sites actually work.",
  },
  {
    name: "Managed digital services",
    blurb: "From access control to operational tooling—shipped with support, not just a login.",
  },
  {
    name: "Platform & identity",
    blurb: "NetHubKe resource server: validate once, resolve the user, keep clients consistent.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 bg-nh-radial" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 bg-nh-grid bg-nh-grid opacity-40"
          aria-hidden
        />
        <div className="nh-container relative nh-section">
          <p className="nh-eyebrow">NetHub</p>
          <h1 className="nh-title mt-3 max-w-3xl">
            Infrastructure and identity for teams that cannot afford guesswork
          </h1>
          <p className="nh-lead mt-5">
            We connect places, people, and products—with a single, IdP-agnostic way to know who is
            on the other end of every request.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="nh-btn-primary">
              Start a conversation
            </Link>
            <Link href="/services" className="nh-btn-secondary">
              Explore services
            </Link>
          </div>
        </div>
      </section>

      <section className="nh-section border-b border-line">
        <div className="nh-container">
          <p className="nh-eyebrow">Why NetHub</p>
          <h2 className="mt-2 max-w-2xl font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Built for operators, not demos
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {pillars.map((item) => (
              <article key={item.title} className="nh-card">
                <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="nh-section border-b border-line bg-canvas-soft/50">
        <div className="nh-container">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="nh-eyebrow">Services</p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                What we deliver
              </h2>
            </div>
            <Link href="/services" className="nh-link text-sm">
              Full service list →
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {services.map((s) => (
              <article
                key={s.name}
                className="rounded-nh-lg border border-line bg-surface/80 p-5 transition hover:border-brand/40 hover:shadow-nh-glow"
              >
                <h3 className="font-medium text-ink">{s.name}</h3>
                <p className="mt-2 text-sm text-ink-muted">{s.blurb}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="nh-section">
        <div className="nh-container">
          <div className="nh-card flex flex-col items-start gap-6 bg-surface-raised sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
                Ready when you are
              </h2>
              <p className="mt-2 max-w-xl text-sm text-ink-muted">
                Tell us about your sites, users, or product stack. We will respond with a clear
                next step—not a generic brochure.
              </p>
            </div>
            <Link href="/contact" className="nh-btn-primary shrink-0">
              Contact NetHub
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
