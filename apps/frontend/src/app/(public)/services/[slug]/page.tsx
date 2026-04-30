"use client";

import React from "react";
import Script from "next/script";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Loader2,
  AlertCircle,
  MessageSquare,
  Shield,
  Activity,
} from "lucide-react";
import { useApi } from "@/lib/hooks/useApi";
import { z } from "zod";
import { ServiceRead } from "@/lib/types/api";


// type Service = z.infer<typeof ServiceRead>;

export default function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = React.use(params);

  const { data, error, isLoading, isError } = useApi<ServiceRead[]>(
    slug,
    `/services/get-services`, {slug: slug}
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
        <p className="text-muted font-medium tracking-widest uppercase text-xs">
          Synchronizing Expertise...
        </p>
      </div>
    );
  }

  const service = data?.[0];
  if (isError || !service) notFound();

  return (
    <>
      {/* SEO FAQ Schema */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity:
              service.faqs?.map((faq: any) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: { "@type": "Answer", text: faq.answer },
              })) || [],
          }),
        }}
      />

      <article className="min-h-screen pb-24 selection:bg-brand-primary/20">
        {/* 1. Hero Section: Outcome-Focused */}
        <header className="relative py-24 md:py-32 bg-surface/30 border-b border-border overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
              <Zap size={14} /> Performance • Security • Scale
            </div>
            <h1 className="text-h1 mb-4 text-gradient">
              {service.title}
            </h1>
            <p className=" text-pretty">
              {service.description}
            </p>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-3 gap-16 items-start">
            {/* Left: Deep Authority Content */}
            <div className="lg:col-span-2 space-y-24">
              {/* Technical Capabilities */}
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
                  {service.features?.map((feature, i) => (
                    <div
                      key={i}
                      className="group p-6 rounded-2xl bg-card border border-border hover:border-brand-primary/30 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle2
                          className="text-brand-primary shrink-0"
                          size={18}
                        />
                        <span className="font-bold text-foreground tracking-tight">
                          {feature}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Consultation Process (Fixed Content) */}
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
                  ].map((p, i) => (
                    <div key={i} className="flex gap-6 group">
                      <span className="text-sm font-bold text-brand-primary opacity-40 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                        {p.step}
                      </span>
                      <div>
                        <h4 className="font-bold text-lg mb-1">{p.title}</h4>
                        <p className="text-muted text-sm leading-relaxed">
                          {p.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQ */}
              {service.faqs && (
                <section>
                  <h2 className="text-3xl font-bold mb-10">Common Questions</h2>
                  <div className="grid gap-6">
                    {service.faqs.map((faq: any, i) => (
                      <div
                        key={i}
                        className="p-8 rounded-3xl bg-surface border border-border"
                      >
                        <h3 className="text-lg font-bold mb-3">
                          {faq.question}
                        </h3>
                        <p className="text-muted leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right: Sticky Conversion Sidebar */}
            <aside className="sticky top-24">
              <div className="card-layered p-8 rounded-4xl border border-brand-primary/20 shadow-2xl shadow-brand-primary/5">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  Consultation
                </h3>

                <p className="text-sm text-muted leading-relaxed mb-8">
                  Ready to modernize your infrastructure? Book a strategy call
                  to discuss your specific requirements and get a custom quote.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-xs font-bold text-foreground">
                    <CheckCircle2 size={14} className="text-brand-primary" />
                    Direct Access to Senior Engineers
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-foreground">
                    <CheckCircle2 size={14} className="text-brand-primary" />
                    No-Obligation Architecture Review
                  </div>
                </div>

                <button className="w-full bg-brand-primary text-white py-5 rounded-2xl font-bold hover:shadow-glow transition-all flex items-center justify-center gap-2 group">
                  Book Strategy Call
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>

                <p className="text-center text-[10px] text-muted mt-6 uppercase tracking-[0.2em] font-bold opacity-60">
                  Response within 24 hours
                </p>
              </div>

              {/* Local Contact Signal */}
              <div className="mt-8 flex items-center justify-center gap-4 text-muted">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Team Available in Nairobi
                </span>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}