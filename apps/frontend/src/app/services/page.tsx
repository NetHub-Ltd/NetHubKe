import type { Metadata } from "next";
import Link from "next/link";
import { siteServices } from "@/content/site-services";

export const metadata: Metadata = {
  title: "Web Development, Mobile Apps & SEO for Kenyan Businesses",
  description: "Explore NetHub's website development, mobile applications, SEO and business technology services for organisations in Kenya.",
  alternates: { canonical: "/services" },
  openGraph: { title: "Web Development, Mobile Apps & SEO for Kenyan Businesses", description: "Explore NetHub's website development, mobile applications, SEO and business technology services for organisations in Kenya.", url: "/services" },
};

const approach = [
  { number: "01", title: "Understand the challenge", body: "We start with your business, customers and current process." },
  { number: "02", title: "Agree on a practical scope", body: "We clarify priorities, constraints and the useful first outcome." },
  { number: "03", title: "Build, launch and improve", body: "We deliver and identify what to maintain or improve next." },
];

export default function ServicesPage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_0%,rgba(79,70,229,0.16),transparent_45%)]" aria-hidden />
        <div className="nh-container nh-section">
          <p className="nh-badge">Services · Kenya</p>
          <h1 className="nh-title mt-6 max-w-4xl">Practical technology for the things your business needs to move forward.</h1>
          <p className="nh-lead mt-6">NetHub works with businesses and organisations to attract customers, improve digital experiences and make everyday operations work better.</p>
          <Link href="/contact" className="nh-btn-primary mt-8">Request a practical recommendation <span aria-hidden>↗</span></Link>
        </div>
      </section>

      <section className="nh-section">
        <div className="nh-container">
          <div className="max-w-2xl">
            <p className="nh-eyebrow">Explore services</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Find the area that matches what you need to improve.</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {siteServices.map((service, index) => (
              <article key={service.slug} className="nh-card flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <span className="nh-icon-chip" aria-hidden>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h10M4 18h7" /></svg>
                  </span>
                  <span className="font-display text-sm font-bold text-brand">0{index + 1}</span>
                </div>
                <h3 className="mt-6 font-display text-xl font-bold text-ink">{service.shortTitle}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">{service.summary}</p>
                <Link href={`/services/${service.slug}`} className="nh-link mt-6 inline-flex text-sm">Explore service <span aria-hidden>↗</span></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-canvas-soft">
        <div className="nh-container nh-section">
          <div className="max-w-2xl">
            <p className="nh-eyebrow">How we work</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Understand first. Build with purpose.</h2>
          </div>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {approach.map((step) => (
              <li key={step.number} className="nh-card">
                <p className="font-display text-sm font-bold text-brand">{step.number}</p>
                <h3 className="mt-5 font-display text-xl font-bold text-ink">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="nh-section">
        <div className="nh-container">
          <div className="nh-cta-band">
            <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <div className="max-w-xl">
                <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Not sure where to begin?</h2>
                <p className="mt-4 text-base leading-relaxed text-blue-100">Tell us what is getting in the way. We can help you decide the right next step.</p>
              </div>
              <Link href="/contact" className="nh-btn min-h-12 shrink-0 bg-white text-brand hover:bg-blue-50">Start a conversation <span aria-hidden>↗</span></Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
