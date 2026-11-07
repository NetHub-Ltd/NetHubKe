import type { Metadata } from "next";
import Link from "next/link";
import { siteServices } from "@/content/site-services";

export const metadata: Metadata = {
  title: "Web Development, Mobile Apps & SEO for Kenyan Businesses",
  description: "Explore NetHub's website development, mobile applications, SEO and business technology services for organisations in Kenya.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Web Development, Mobile Apps & SEO for Kenyan Businesses",
    description: "Explore NetHub's website development, mobile applications, SEO and business technology services for organisations in Kenya.",
    url: "/services",
  },
  twitter: {
    card: "summary_large_image",
    title: "Web Development, Mobile Apps & SEO for Kenyan Businesses",
    description: "Explore NetHub's website development, mobile applications, SEO and business technology services for organisations in Kenya.",
  },
};

const approach = [
  { number: "01", title: "Understand the challenge", body: "We start with your business, customers and current process. The aim is to understand what needs to change before choosing a tool." },
  { number: "02", title: "Agree on a practical scope", body: "We clarify priorities, constraints and what a useful first outcome should look like, then agree on the work to be done." },
  { number: "03", title: "Build, launch and improve", body: "We deliver against the agreed scope and identify what should be measured, maintained or improved after launch." },
];

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "NetHub services",
  itemListElement: siteServices.map((service, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: service.title,
    url: `https://nethub.co.ke/services/${service.slug}`,
  })),
};

export default function ServicesPage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema).replace(/</g, "\\u003c") }} />

      <section className="border-b border-line bg-[radial-gradient(ellipse_at_75%_0%,rgba(37,99,235,0.12),transparent_45%)]">
        <div className="nh-container nh-section">
          <p className="nh-eyebrow">Services · Kenya</p>
          <h1 className="nh-title mt-4 max-w-4xl">Practical technology for the things your business needs to move forward.</h1>
          <p className="nh-lead mt-6">NetHub works with businesses and organisations to attract customers, improve digital experiences and make everyday operations work better. Start with the challenge; we will help you identify the right solution.</p>
          <Link href="/contact" className="nh-btn-primary mt-8">Request a practical recommendation <span aria-hidden>↗</span></Link>
        </div>
      </section>

      <section className="nh-section">
        <div className="nh-container">
          <div className="max-w-2xl">
            <p className="nh-eyebrow">Explore our services</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Find the area that matches what you need to improve.</h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">Each engagement is scoped around the business need. You do not have to choose a technology or arrive with a finished specification.</p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {siteServices.map((service, index) => (
              <article key={service.slug} className="nh-surface-lift flex h-full flex-col rounded-2xl p-7 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand">{service.eyebrow}</p>
                <h3 className="mt-4 font-display text-xl font-semibold text-ink">{service.shortTitle}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">{service.summary}</p>
                <Link href={`/services/${service.slug}`} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline">Explore this service <span aria-hidden>↗</span></Link>
                <span className="mt-5 border-t border-line pt-4 text-xs font-semibold text-ink-subtle">0{index + 1} / 0{siteServices.length}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-canvas-soft">
        <div className="nh-container nh-section">
          <div className="max-w-2xl">
            <p className="nh-eyebrow">How to choose</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Start with the outcome you need.</h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">If you are unsure which service fits, describe the business problem. We can help you decide whether a website, application, search improvement or connected system is the right next step.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {["Need more enquiries?|Start with websites, landing pages, SEO and conversion improvement.", "Need smoother operations?|Start with business systems, integrations and workflow improvement.", "Need a digital product?|Start with product scoping, web or mobile application development."].map((item) => {
              const [title, body] = item.split("|");
              return (
                <article key={title} className="nh-card">
                  <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">{body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="nh-section">
        <div className="nh-container">
          <div className="max-w-2xl">
            <p className="nh-eyebrow">How we work</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Understand first. Build with purpose.</h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">Good work starts before development. We want the scope to solve the right problem and make sense for the people who will use the result.</p>
          </div>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {approach.map((step) => (
              <li key={step.number} className="rounded-2xl border border-line bg-surface p-7">
                <p className="font-display text-sm font-semibold text-brand">{step.number}</p>
                <h3 className="mt-5 font-display text-xl font-semibold text-ink">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="nh-section">
        <div className="nh-container flex flex-col justify-between gap-7 md:flex-row md:items-center">
          <div className="max-w-xl">
            <p className="nh-eyebrow">Not sure where to begin?</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">Tell us what is getting in the way.</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">We can help you think through the problem and decide whether a website, application, search improvement or connected system is the right next step.</p>
          </div>
          <Link href="/contact" className="nh-btn-primary shrink-0">Start a conversation <span aria-hidden>↗</span></Link>
        </div>
      </section>
    </main>
  );
}
