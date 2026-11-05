import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteService, siteServices } from "@/content/site-services";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return siteServices.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getSiteService(slug);

  if (!service) return { title: "Service not found" };

  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title: service.metaTitle,
      description: service.metaDescription,
      url: `/services/${service.slug}`,
    },
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getSiteService(slug);

  if (!service) notFound();

  const applyHref = `/dashboard/requests/new?service=${service.slug}`;

  return (
    <main>
      <section className="border-b border-line bg-[radial-gradient(ellipse_at_75%_0%,rgba(37,99,235,0.12),transparent_45%)]">
        <div className="nh-container nh-section">
          <div className="mb-6 flex flex-wrap gap-3">
            <Link href={applyHref} className="nh-btn-primary">
              Get a quote
            </Link>
            <Link href="/contact" className="nh-btn-secondary">
              Talk to us
            </Link>
          </div>
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-sm">
              <li>
                <Link href="/services" className="font-semibold text-brand hover:underline">
                  All services
                </Link>
              </li>
              <li aria-hidden="true" className="text-ink-subtle">/</li>
              <li aria-current="page" className="text-ink-muted">{service.shortTitle}</li>
            </ol>
          </nav>
          <p className="nh-eyebrow mt-8">{service.eyebrow} · NetHub Kenya</p>
          <h1 className="nh-title mt-4 max-w-4xl">{service.title}</h1>
          <p className="nh-lead mt-6">{service.summary}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/contact?service=${encodeURIComponent(service.contactValue)}`}
              className="nh-btn-primary"
            >
              Discuss your requirements <span aria-hidden>↗</span>
            </Link>
            <Link href="/about" className="nh-btn-secondary">
              How we approach the work
            </Link>
          </div>
        </div>
      </section>

      <section className="nh-section">
        <div className="nh-container grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="nh-eyebrow">Start with the business need</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
              Built around the business outcome, not just the deliverable.
            </h2>
          </div>
          <div>
            <p className="text-base leading-relaxed text-ink-muted">{service.introduction}</p>
            <h3 className="mt-8 font-display text-xl font-semibold text-ink">
              This may be relevant if…
            </h3>
            <ul className="mt-4 space-y-3">
              {service.problems.map((problem) => (
                <li key={problem} className="flex items-start gap-3 text-sm leading-relaxed text-ink-muted">
                  <span className="mt-0.5 text-brand" aria-hidden>↗</span>
                  <span>{problem}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-canvas-soft">
        <div className="nh-container nh-section grid gap-10 lg:grid-cols-2">
          <div>
            <p className="nh-eyebrow">What we can work on</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
              A scope shaped around what needs to improve.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-muted">
              The right combination depends on your goals, existing tools and constraints. These are
              common areas we can assess together, not a fixed package.
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-7 sm:p-9">
            <ul className="grid gap-4 sm:grid-cols-2">
              {service.deliverables.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-medium text-ink">
                  <span className="text-brand" aria-hidden>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="nh-section">
        <div className="nh-container">
          <p className="nh-eyebrow">What good looks like</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight text-ink">
            The work should make a difference beyond launch.
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {service.outcomes.map((outcome, index) => (
              <article key={outcome} className="rounded-2xl border border-line bg-surface p-7">
                <p className="font-display text-sm font-semibold text-brand">0{index + 1}</p>
                <p className="mt-4 text-base font-semibold leading-relaxed text-ink">{outcome}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-canvas-soft">
        <div className="nh-container nh-section">
          <div className="max-w-2xl">
            <p className="nh-eyebrow">A few useful questions</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
              Before we get started.
            </h2>
          </div>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {service.questions.map((item) => (
              <article key={item.question} className="py-6">
                <h3 className="font-display text-lg font-semibold text-ink">{item.question}</h3>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="nh-section">
        <div className="nh-container">
          <div className="rounded-[2rem] bg-blue-600 px-7 py-12 text-white sm:px-12 sm:py-14">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
              Start with a conversation
            </p>
            <div className="mt-4 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  Tell us what you need to make better.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-blue-100">
                  You do not need a complete specification. Share the challenge and we can work out
                  the right next step together.
                </p>
              </div>
              <Link
                href={`/contact?service=${encodeURIComponent(service.contactValue)}`}
                className="nh-btn min-h-12 shrink-0 bg-white text-blue-700 hover:bg-blue-50"
              >
                Talk to NetHub <span aria-hidden>↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
