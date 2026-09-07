import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Zap,
  Activity,
  CheckCircle,
  Shield,
  ArrowRight,
} from "lucide-react";
import { services } from "@/lib/data/services";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);

  if (!service) {
    return {
      title: "Service not found",
    };
  }

  const title = service.title;
  const description =
    service.shortDesc.length > 155
      ? `${service.shortDesc.slice(0, 152)}...`
      : service.shortDesc;

  return {
    title,
    description,
    keywords: service.seoKeywords,
    alternates: {
      canonical: `/services/${service.slug}`,
    },
    openGraph: {
      title: `${service.title} | NetHub Kenya`,
      description,
      url: `https://nethub.co.ke/services/${service.slug}`,
      type: "website",
    },
  };
}

/**
 * Service detail — fully server-rendered from the static catalogue.
 * Content (title, description, features, FAQs, pricing) is in the initial HTML.
 */
export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);

  if (!service) {
    notFound();
  }

  const faqSchema =
    service.faqs && service.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: service.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <article className="min-h-screen pb-24 selection:bg-brand-primary/20">
        <header className="relative py-24 md:py-32 bg-surface/30 border-b border-border overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
              <Zap size={14} /> Performance • Security • Scale
            </div>
            <h1 className="text-h1 mb-4 text-gradient">{service.title}</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl text-pretty leading-relaxed">
              {service.description}
            </p>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-3 gap-16 items-start">
            <div className="lg:col-span-2 space-y-24">
              <section>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <Activity size={20} />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">
                    Technical Capabilities
                  </h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {service.features.map((feature, i) => (
                    <div
                      key={i}
                      className="group p-6 rounded-2xl bg-card border border-border hover:border-brand-primary/30 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle
                          size={18}
                          className="text-brand-primary shrink-0"
                        />
                        <span className="font-bold text-foreground tracking-tight">
                          {feature}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold tracking-tight mb-8">
                  Business outcomes
                </h2>
                <ul className="space-y-4">
                  {service.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle
                        size={18}
                        className="text-brand-primary mt-1 shrink-0"
                      />
                      <span className="text-muted-foreground leading-relaxed">
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="relative p-10 rounded-[2.5rem] bg-brand-primary/2 border border-brand-primary/10 overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-brand-primary/5">
                  <Shield size={120} />
                </div>
                <h2 className="text-3xl font-bold mb-10 relative z-10">
                  How we launch
                </h2>
                <div className="space-y-8 relative z-10">
                  {[
                    {
                      step: "01",
                      title: "Strategy Call",
                      desc: "We align on your business goals and technical constraints.",
                    },
                    {
                      step: "02",
                      title: "Technical Audit",
                      desc: "A deep dive into your existing stack or requirements.",
                    },
                    {
                      step: "03",
                      title: "Bespoke Build",
                      desc: "Agile development with weekly sprints and transparent demos.",
                    },
                    {
                      step: "04",
                      title: "Scalable Launch",
                      desc: "Production deployment with post-launch optimization.",
                    },
                  ].map((p) => (
                    <div key={p.step} className="flex gap-6 group">
                      <span className="text-sm font-bold text-brand-primary opacity-40 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                        {p.step}
                      </span>
                      <div>
                        <h3 className="font-bold text-lg mb-1">{p.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {p.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {service.faqs && service.faqs.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold mb-10">Common Questions</h2>
                  <div className="space-y-6">
                    {service.faqs.map((faq, i) => (
                      <div
                        key={i}
                        className="p-6 rounded-2xl border border-border bg-card"
                      >
                        <h3 className="font-bold text-lg mb-2">
                          {faq.question}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar: Pricing + CTA */}
            <aside className="lg:sticky lg:top-28 space-y-8">
              <div className="p-8 rounded-3xl border border-border bg-card shadow-sm">
                <h2 className="text-xl font-bold mb-6">Investment</h2>
                <ul className="space-y-4 mb-8">
                  {service.pricing.map((tier, i) => (
                    <li
                      key={i}
                      className="flex flex-col gap-1 pb-4 border-b border-border last:border-0 last:pb-0"
                    >
                      <div className="flex justify-between items-baseline gap-4">
                        <span className="font-semibold">{tier.label}</span>
                        <span className="font-bold text-brand-primary whitespace-nowrap">
                          {tier.price}
                        </span>
                      </div>
                      {tier.description && (
                        <span className="text-xs text-muted-foreground">
                          {tier.description}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-brand-primary text-white font-bold hover:opacity-90 transition-opacity"
                >
                  Start a project
                  <ArrowRight size={18} />
                </Link>
              </div>
              <p className="text-xs text-muted-foreground text-center px-2">
                Pricing in Kenyan Shillings. Final scope confirmed after a short
                technical discovery call.
              </p>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
