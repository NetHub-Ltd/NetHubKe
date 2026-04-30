"use client";

import { Loader2, AlertCircle, ArrowRight, Cog } from "lucide-react";
import Link from "next/link";
import { useApi } from "@/lib/hooks/useApi";
import { ServiceCard } from "@/lib/components/services/servicecard";
import { ServiceRead } from "@/lib/types/api";


const ServicesPage = () => {
  const { data, error, isLoading, isError } = useApi<ServiceRead[]>(
    "services",
    "/services/get-services",
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. Strategic Header: Positioning as an Architect */}
      <section className="border-b border-border bg-card/30">
        <div className="max-w-7xl mx-auto py-16 md:py-28 px-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 mb-6">
            <Cog size={14} className="text-brand-primary animate-spin-slow" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">
              Engineering Excellence
            </span>
          </div>
          <h1 className="text-h1 mb-6 text-gradient max-w-4xl leading-tight">
            Scalable Systems for <br />
            <span className="text-foreground">Modern Enterprises.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl text-pretty">
            We don't just build apps; we architect the technical backbone of
            Kenya’s digital leaders. Specialized in high-concurrency web apps,
            mobile apps, and custom software, we prioritize conversion-first engineering.
          </p>
        </div>
      </section>

      {/* 2. Main Catalog: Grid Layout */}
      <div className="py-20 px-6 max-w-7xl mx-auto w-full">
        {isLoading && (
          <div className="grid md:grid-cols-2 gap-8 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-100px bg-card/50 rounded-3xl border border-border"
              />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 bg-red-500/5 border border-red-500/10 rounded-[2.5rem] gap-6 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Systems Offline</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                Our service catalog is temporarily unreachable. Please refresh
                or contact our engineers directly.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-foreground text-background py-3 px-8 rounded-xl font-bold transition-all hover:scale-105"
              >
                Retry Connection
              </button>
              <Link
                href="/contact"
                className="py-3 px-8 border border-border rounded-xl font-bold"
              >
                Direct Support
              </Link>
            </div>
          </div>
        )}

        {!isLoading && !isError && data && (
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {data.map((service) => (
              <ServiceCard
                key={service.slug}
                service={{
                  title: service.title,
                  short_desc: service.short_desc,
                  features: service.features,
                  slug: service.slug,
                  icon: service.icon,
                }}
              />
            ))}

            {/* 3. "Custom Solution" Placeholder: Revenue Blueprint */}
            <div className="flex flex-col justify-center p-8 md:p-12 border-2 border-dashed border-border rounded-3xl bg-card/10 hover:bg-card/30 transition-colors group">
              <h3 className="text-3xl font-bold mb-4 tracking-tight">
                Need a custom engineering solution?
              </h3>
              <p className="text-muted-foreground mb-8 text-lg">
                Have a unique technical challenge? We architect custom APIs,
                proprietary middleware, and internal automation tools.
              </p>
              <Link
                href="/contact"
                className="flex items-center gap-2 text-brand-primary font-bold text-lg group-hover:gap-4 transition-all"
              >
                Start a Technical Discovery <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 4. Social Proof / Process Bar */}
      <section className="border-y border-border py-12 bg-card/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
          <span className="font-bold tracking-widest uppercase text-xs">
            Modern Tech Stack
          </span>
          <span className="font-bold tracking-widest uppercase text-xs">
            Next.js 16
          </span>
          <span className="font-bold tracking-widest uppercase text-xs">
            Go-Fiber / Python
          </span>
          <span className="font-bold tracking-widest uppercase text-xs">
            PostgreSQL
          </span>
          <span className="font-bold tracking-widest uppercase text-xs">
            Daraja 3.0
          </span>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
