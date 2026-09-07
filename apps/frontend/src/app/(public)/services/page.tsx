import type { Metadata } from "next";
import { Cog } from "lucide-react";
import Link from "next/link";
import { ServiceCard } from "@/lib/components/services/servicecard";
import { services } from "@/lib/data/services";

export const metadata: Metadata = {
  title: "Services — M-Pesa, Apps & SEO for Kenyan Businesses",
  description:
    "Explore NetHub services: M-Pesa Daraja API integration, custom app development, and SEO for Kenyan businesses. Clear pricing and delivery focused on results.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "NetHub Services | M-Pesa, Apps & SEO Kenya",
    description:
      "M-Pesa API integration, custom mobile & web apps, and SEO for Kenyan businesses.",
    url: "https://nethub.co.ke/services",
  },
};

/** Map static catalogue icons to the keys ServiceCard expects. */
function toCardIcon(icon: string): string {
  const map: Record<string, string> = {
    CreditCard: "CREDIT_CARD",
    Smartphone: "SMARTPHONE",
    Search: "SEARCH",
    Globe: "GLOBE",
    ShoppingBag: "SHOPPING_BAG",
  };
  return map[icon] ?? icon.toUpperCase();
}

/**
 * Services hub — server-rendered from the static catalogue so titles,
 * descriptions, and links are present in the initial HTML for crawlers.
 */
export default function ServicesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <section className="border-b border-border bg-card/30">
        <div className="max-w-7xl mx-auto py-16 md:py-28 px-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 mb-6">
            <Cog size={14} className="text-brand-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">
              Engineering Excellence
            </span>
          </div>
          <h1 className="text-h1 mb-6 text-gradient max-w-4xl leading-tight">
            Scalable Systems for <br />
            <span className="text-foreground">Modern Enterprises.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl text-pretty">
            We don&apos;t just build apps; we architect the technical backbone of
            Kenya&apos;s digital leaders. Specialized in high-concurrency web apps,
            mobile apps, and custom software, we prioritize conversion-first
            engineering.
          </p>
        </div>
      </section>

      <div className="py-20 px-6 max-w-7xl mx-auto w-full">
        {services.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            Services catalogue is being updated. Please check back shortly.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service) => (
              <ServiceCard
                key={service.slug}
                service={{
                  title: service.title,
                  slug: service.slug,
                  short_desc: service.shortDesc,
                  features: service.features,
                  icon: toCardIcon(service.icon),
                }}
              />
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Need something specific? Tell us about your project.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 font-bold text-brand-primary hover:underline"
          >
            Request a technical discovery
          </Link>
        </div>
      </div>
    </div>
  );
}
