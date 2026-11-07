import type { Metadata } from "next";
import Link from "next/link";
import { siteServices } from "@/content/site-services";

export const metadata: Metadata = {
  title: "Business Technology, Websites & SEO in Kenya",
  description: "NetHub helps Kenyan businesses attract customers, improve operations and build useful digital products through websites, applications, SEO and practical technology.",
  alternates: { canonical: "/" },
  openGraph: { url: "/", title: "NetHub | Business growth through technology", description: "Better digital experiences, smarter systems and technology shaped around real business needs." },
};

const capabilities = [
  { title: "Be discovered", body: "Search visibility and a clear digital presence.", icon: "M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" },
  { title: "Convert interest", body: "Useful websites and customer experiences.", icon: "M4 6h16M4 12h10M4 18h7" },
  { title: "Operate better", body: "Connected systems and practical software.", icon: "M4 7h16M4 12h16M4 17h10" },
];

const priorities = [
  { number: "01", title: "Attract the right customers", body: "Make your business easier to find, understand and contact with a useful website and stronger search presence." },
  { number: "02", title: "Improve how work gets done", body: "Reduce avoidable friction with practical software, connected tools and workflows shaped around your operations." },
  { number: "03", title: "Bring an idea to life", body: "Turn a business need into a clear digital product scope, then build an experience people can actually use." },
];

const workStages = [
  { number: "01", title: "Understand", body: "We start with the business goal, the people involved and what is getting in the way." },
  { number: "02", title: "Make a plan", body: "We agree on the simplest useful solution, a clear scope and the right priorities." },
  { number: "03", title: "Deliver and improve", body: "We deliver a working solution and a practical view of what should happen next." },
];

export default function HomePage() {
  return (
    <main>
      <section className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_10%,rgba(79,70,229,0.18),transparent_45%),radial-gradient(ellipse_at_10%_20%,rgba(6,182,212,0.12),transparent_50%)]" aria-hidden />
        <div className="nh-container grid min-h-[720px] items-center gap-14 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <p className="nh-badge">Business growth partner · Kenya</p>
            <h1 className="nh-title mt-6">Make technology work harder for your <span className="nh-gradient-text">business.</span></h1>
            <p className="nh-lead mt-6">NetHub helps growing businesses turn digital friction into clearer customer journeys, better-operating systems and useful digital products. We start with the business outcome—not a technology looking for a problem.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/contact" className="nh-btn-primary">Request a practical recommendation <span aria-hidden>↗</span></Link>
              <Link href="/services" className="nh-btn-secondary">Explore services</Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-3 text-sm text-ink-muted">
              {["Websites", "Web & mobile apps", "SEO", "Business systems"].map((item) => (
                <span key={item} className="rounded-full border border-line bg-surface px-4 py-2 font-medium">{item}</span>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="nh-glass relative p-8 shadow-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">A clearer path to progress</p>
              <h2 className="mt-4 font-display text-2xl font-bold leading-snug text-white sm:text-3xl">The right technology starts with the right business need.</h2>
              <ol className="mt-8">
                {capabilities.map((item, index) => (
                  <li key={item.title} className="flex items-start gap-4 border-t border-white/10 py-5">
                    <span className="nh-icon-chip" aria-hidden>
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d={item.icon} /></svg>
                    </span>
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-300">{item.body}</p>
                    </div>
                    <span className="ml-auto font-display text-sm font-semibold text-cyan-300">0{index + 1}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="nh-section">
        <div className="nh-container">
          <div className="max-w-2xl">
            <p className="nh-eyebrow">Who we help</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">For businesses that need digital work to produce a real result.</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {priorities.map((item) => (
              <article key={item.number} className="nh-card">
                <p className="font-display text-sm font-bold text-brand">{item.number}</p>
                <h3 className="mt-5 font-display text-xl font-bold text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-canvas-soft">
        <div className="nh-container nh-section">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="max-w-xl">
              <p className="nh-eyebrow">What we do</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Practical digital work, tied to a business outcome.</h2>
            </div>
            <Link href="/services" className="nh-link text-sm">View all services <span aria-hidden>↗</span></Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {siteServices.map((service, index) => (
              <article key={service.slug} className="nh-card">
                <div className="flex items-center justify-between">
                  <span className="nh-icon-chip" aria-hidden>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h10M4 18h7" /></svg>
                  </span>
                  <span className="font-display text-sm font-bold text-brand">0{index + 1}</span>
                </div>
                <h3 className="mt-6 font-display text-xl font-bold text-ink">{service.shortTitle}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{service.summary}</p>
                <Link href={`/services/${service.slug}`} className="nh-link mt-5 inline-flex text-sm">See how we can help <span aria-hidden>↗</span></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="nh-section">
        <div className="nh-container grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="nh-eyebrow">How we work</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Understand first. Build with purpose.</h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">You do not need to arrive with a technical brief. We help clarify the problem, explore what is practical and agree on a useful way forward.</p>
            <Link href="/about" className="nh-link mt-6 inline-flex text-sm">More about our approach <span className="ml-2" aria-hidden>↗</span></Link>
          </div>
          <ol className="grid gap-4 md:grid-cols-3">
            {workStages.map((stage) => (
              <li key={stage.number} className="nh-card">
                <p className="font-display text-sm font-bold text-brand">{stage.number}</p>
                <h3 className="mt-5 font-display text-lg font-bold text-ink">{stage.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{stage.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="nh-section">
        <div className="nh-container">
          <div className="nh-cta-band">
            <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">A good place to start</p>
                <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">Tell us what you want to make better.</h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-blue-100">Share the business challenge or opportunity. We will help you think through the possibilities and a practical next step.</p>
              </div>
              <Link href="/contact" className="nh-btn min-h-12 shrink-0 bg-white text-brand hover:bg-blue-50">Start a conversation <span aria-hidden>↗</span></Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
