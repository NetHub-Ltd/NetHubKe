import type { Metadata } from "next";
import Link from "next/link";
import { siteServices } from "@/content/site-services";

export const metadata: Metadata = {
  title: "Business Technology, Websites & SEO in Kenya",
  description: "NetHub helps Kenyan businesses attract customers, improve operations and build useful digital products through websites, applications, SEO and practical technology.",
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: "NetHub | Business growth through technology",
    description: "Better digital experiences, smarter systems and technology shaped around real business needs.",
  },
};

const businessPriorities = [
  { number: "01", title: "Attract the right customers", body: "Make your business easier to find, understand and contact with a useful website and a stronger search presence." },
  { number: "02", title: "Improve how work gets done", body: "Reduce avoidable friction with practical software, connected tools and workflows shaped around your operations." },
  { number: "03", title: "Bring a useful idea to life", body: "Turn a business need into a clear digital product scope, then build an experience people can actually use." },
];

const workStages = [
  { number: "01", title: "Understand", body: "We start with the business goal, the people involved and what is getting in the way." },
  { number: "02", title: "Make a plan", body: "We agree on the simplest useful solution, a clear scope and the right priorities." },
  { number: "03", title: "Deliver and improve", body: "We deliver a working solution and a practical view of what should happen next." },
];

const deliveryPrinciples = [
  { title: "Business first", body: "We start with the outcome you need, then choose the technology and scope that support it." },
  { title: "Clear scope", body: "We make the work, priorities and expected deliverables easier to understand before building." },
  { title: "Practical delivery", body: "We favour usable, maintainable solutions over unnecessary complexity." },
  { title: "Room to improve", body: "We help you plan a sensible next step after the first version is working." },
];

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "NetHub",
  url: "https://nethub.co.ke",
  description: "NetHub helps Kenyan businesses attract customers, improve operations and build useful digital products through websites, applications, SEO and practical technology.",
  areaServed: "Kenya",
  knowsAbout: ["Website design", "Web development", "Mobile application development", "Search engine optimisation", "Business systems"],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "NetHub",
  url: "https://nethub.co.ke",
};

export default function HomePage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />

      <section className="relative isolate overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_10%,rgba(37,99,235,0.13),transparent_42%)]" aria-hidden />
        <div className="nh-container grid min-h-[620px] items-center gap-12 py-20 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
          <div className="max-w-2xl">
            <p className="nh-eyebrow">Business growth partner · Kenya</p>
            <h1 className="nh-title mt-5">Make technology work harder for your <span className="text-brand">business.</span></h1>
            <p className="nh-lead mt-6">NetHub helps growing businesses turn digital friction into clearer customer journeys, better-operating systems and useful digital products. We start with the business outcome—not a technology looking for a problem.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/contact" className="nh-btn-primary">Request a practical recommendation <span aria-hidden>↗</span></Link>
              <Link href="/services" className="nh-btn-secondary">Explore our services</Link>
            </div>
            <p className="mt-7 text-sm text-ink-subtle">Websites · Web and mobile applications · SEO · Business systems</p>
          </div>

          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="absolute -right-5 -top-5 h-32 w-32 rounded-full bg-cyan-200/50 blur-3xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-7 shadow-2xl sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">A clearer path to progress</p>
              <h2 className="mt-3 max-w-sm font-display text-2xl font-semibold leading-snug text-white sm:text-3xl">The right technology starts with the right business need.</h2>
              <ol className="mt-8 space-y-0">
                {["Be discovered|Search visibility and a clear digital presence", "Turn interest into action|Useful websites and customer experiences", "Run with more control|Connected systems and practical software"].map((item, index) => {
                  const [title, detail] = item.split("|");
                  return (
                    <li key={title} className="flex gap-4 border-t border-white/10 py-5">
                      <span className="font-display text-sm font-semibold text-cyan-300">0{index + 1}</span>
                      <div>
                        <p className="font-semibold text-white">{title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-400">{detail}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <p className="border-t border-white/10 pt-5 text-xs leading-relaxed text-slate-400">One practical partner across the digital experience and the systems behind it.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="nh-section">
        <div className="nh-container">
          <div className="max-w-2xl">
            <p className="nh-eyebrow">Who we help</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">For businesses that need digital work to produce a real result.</h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">NetHub works with businesses that need more than a good-looking website: a clearer way to attract customers, serve them online, operate efficiently and turn a practical idea into a usable product.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {["Businesses seeking visibility|Businesses that need a clearer online presence and a more discoverable route to enquiries.", "Teams with operational friction|Teams that need connected tools, better workflows or a practical alternative to manual work.", "Founders with a product idea|Founders and organisations that need help turning an idea into a focused, usable digital product."].map((item) => {
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

      <section className="border-y border-line bg-canvas-soft">
        <div className="nh-container nh-section">
          <div className="max-w-2xl">
            <p className="nh-eyebrow">Start with what needs to change</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">What would make the biggest difference to your business?</h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">Technology is useful when it helps move a real business priority forward. These are some of the challenges we can work through together.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {businessPriorities.map((item) => (
              <article key={item.number} className="border-t-2 border-brand/30 pt-6">
                <p className="font-display text-sm font-semibold text-brand">{item.number}</p>
                <h3 className="mt-4 font-display text-xl font-semibold tracking-tight text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="nh-section">
        <div className="nh-container">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="max-w-xl">
              <p className="nh-eyebrow">What we do</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Practical digital work, tied to a business outcome.</h2>
              <p className="mt-4 text-base leading-relaxed text-ink-muted">Explore the areas where we help businesses make progress.</p>
            </div>
            <Link href="/services" className="nh-link text-sm">View all services <span aria-hidden>↗</span></Link>
          </div>
          <div className="mt-10 grid gap-x-8 gap-y-9 sm:grid-cols-2">
            {siteServices.map((service, index) => (
              <article key={service.slug} className="border-t border-line pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand">0{index + 1} · {service.eyebrow}</p>
                <h3 className="mt-4 font-display text-xl font-semibold text-ink">{service.shortTitle}</h3>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-muted">{service.summary}</p>
                <Link href={`/services/${service.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline">See how we can help <span aria-hidden>↗</span></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="nh-section">
        <div className="nh-container grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="nh-eyebrow">How we work</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Understand first. Build with purpose.</h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">You do not need to arrive with a technical brief. We help clarify the problem, explore what is practical and agree on a useful way forward.</p>
            <Link href="/about" className="nh-link mt-6 inline-flex text-sm">More about our approach <span className="ml-2" aria-hidden>↗</span></Link>
          </div>
          <ol className="divide-y divide-line border-y border-line">
            {workStages.map((stage) => (
              <li key={stage.number} className="flex gap-5 py-6">
                <span className="font-display text-sm font-semibold text-brand">{stage.number}</span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">{stage.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{stage.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-line bg-canvas-soft">
        <div className="nh-container nh-section">
          <div className="max-w-2xl">
            <p className="nh-eyebrow">Why NetHub</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">A practical partner from problem to working solution.</h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">We focus on making digital work understandable, useful and maintainable—not on selling technology for its own sake.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {deliveryPrinciples.map((item) => (
              <article key={item.title} className="nh-card">
                <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="nh-section">
        <div className="nh-container">
          <div className="rounded-[2rem] border border-line bg-surface p-7 shadow-nh-soft sm:p-10">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <p className="nh-eyebrow">Not sure where to start?</p>
                <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Send us the problem you are trying to solve.</h2>
                <p className="mt-3 text-base leading-relaxed text-ink-muted">We can help you clarify the opportunity, identify a practical next step and decide what belongs in the first phase of work.</p>
              </div>
              <Link href="/contact" className="nh-btn-primary shrink-0">Start a conversation <span aria-hidden>↗</span></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="nh-dark-section">
        <div className="nh-container nh-section">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">A good place to start</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Tell us what you want to make better.</h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">Share the business challenge or opportunity. We will help you think through the possibilities and a practical next step.</p>
            </div>
            <Link href="/contact" className="nh-btn min-h-12 shrink-0 bg-white text-blue-700 hover:bg-blue-50">Start a conversation <span aria-hidden>↗</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
