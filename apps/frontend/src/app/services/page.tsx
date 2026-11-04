import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What we do",
  description: "Explore NetHub’s website and web application development, mobile apps, SEO, conversion improvement and business technology services.",
  alternates: { canonical: "/services" },
  openGraph: { url: "/services" },
};

const services = [
  { number: "01", title: "Websites & web applications", description: "Your website should do more than exist. We design and build digital experiences that communicate your value, earn customer trust and make it easier for people to take action.", outcomes: ["Business and service websites", "Custom web applications", "Customer-facing digital experiences"] },
  { number: "02", title: "Mobile applications", description: "Bring useful digital experiences closer to your customers and teams with mobile applications designed around real tasks and everyday use.", outcomes: ["Customer mobile experiences", "Business and operational apps", "Connected digital services"] },
  { number: "03", title: "SEO & conversion improvement", description: "Being online is not the same as being found. We help improve your search visibility, make your offer easier to understand and remove friction from the path to enquiry.", outcomes: ["Technical and on-page SEO", "Search-friendly website structure", "Conversion and journey improvements"] },
  { number: "04", title: "Business technology & infrastructure", description: "We help businesses make better use of technology through practical systems, integrations and infrastructure that support how their operations actually work.", outcomes: ["Business systems and integrations", "Workflow and process automation", "Technology and infrastructure planning"] },
];

export default function ServicesPage() {
  return (
    <main>
      <section className="border-b border-line bg-[radial-gradient(ellipse_at_75%_0%,rgba(37,99,235,0.12),transparent_45%)]">
        <div className="nh-container nh-section"><p className="nh-eyebrow">What we do</p><h1 className="nh-title mt-4 max-w-4xl">We turn business challenges into practical technology solutions.</h1><p className="nh-lead mt-6">From the first impression a customer gets online to the systems behind your operations, we focus on making technology useful to your business.</p></div>
      </section>
      <section className="nh-section">
        <div className="nh-container grid gap-5">
          {services.map((service) => <article key={service.number} className="grid gap-6 rounded-2xl border border-line bg-surface p-7 sm:p-9 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="font-display text-sm font-semibold text-brand">{service.number}</p><h2 className="mt-4 max-w-sm font-display text-2xl font-semibold tracking-tight text-ink">{service.title}</h2></div><div><p className="max-w-2xl text-base leading-relaxed text-ink-muted">{service.description}</p><ul className="mt-6 grid gap-3 sm:grid-cols-2">{service.outcomes.map((outcome) => <li key={outcome} className="flex items-start gap-3 text-sm text-ink"><span className="mt-0.5 text-brand" aria-hidden>↗</span>{outcome}</li>)}</ul><Link href={`/contact?service=${encodeURIComponent(service.title)}`} className="mt-7 inline-flex text-sm font-semibold text-brand hover:underline">Discuss this with us <span className="ml-2" aria-hidden>↗</span></Link></div></article>)}
        </div>
      </section>
      <section className="border-y border-line bg-canvas-soft"><div className="nh-container nh-section flex flex-col justify-between gap-7 md:flex-row md:items-center"><div className="max-w-xl"><p className="nh-eyebrow">No one-size-fits-all</p><h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">Let’s start with what your business needs.</h2><p className="mt-3 text-sm leading-relaxed text-ink-muted">Tell us what you’re trying to improve. We’ll have an honest conversation about the right next step.</p></div><Link href="/contact" className="nh-btn-primary shrink-0">Talk to NetHub <span aria-hidden>↗</span></Link></div></section>
    </main>
  );
}
