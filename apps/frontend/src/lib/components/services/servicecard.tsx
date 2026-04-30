"use client";
import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Code,
  Smartphone,
  Globe,
  Search,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  TrendingUp,
  Users,
} from "lucide-react";
// import { ServiceRead } from "@/lib/schemas/api";
// import { zServiceRead } from "@/lib/types/api/zod.gen";
import { ServiceRead } from "@/lib/types/api";

// type Service = z.infer<typeof ServiceRead>;

const iconMap: Record<string, React.ReactNode> = {
  CREDIT_CARD: <CreditCard className="w-6 h-6" />,
  SMARTPHONE: <Smartphone className="w-6 h-6" />,
  GLOBE: <Globe className="w-6 h-6" />,
  SEARCH: <Search className="w-6 h-6" />,
  SHOPPING_BAG: <ShoppingBag className="w-6 h-6" />,
};

export const ServiceCard = ({
  service,
}: {
  service: Pick<
    ServiceRead,
    "title" | "short_desc" | "features" | "slug" | "icon"
  >;
}) => {
  // Enhanced Revenue Logic: Dynamic Trust Stats
  const getSocialProof = (slug: string) => {
    if (slug.includes("m-pesa") || slug.includes("payments"))
      return {
        label: "99.9% Uptime",
        sub: "M-Pesa Verified",
        icon: <TrendingUp size={12} />,
      };
    if (slug.includes("web"))
      return {
        label: "100 Score",
        sub: "Core Web Vitals",
        icon: <TrendingUp size={12} />,
      };
    if (slug.includes("mobile"))
      return {
        label: "50+ Apps",
        sub: "Live on Stores",
        icon: <Users size={12} />,
      };
    if (slug.includes("seo"))
      return {
        label: "TOP 3",
        sub: "Search Rankings",
        icon: <TrendingUp size={12} />,
      };
    return {
      label: "Certified",
      sub: "Expert Engineers",
      icon: <CheckCircle2 size={12} />,
    };
  };

  const proof = getSocialProof(service.slug);

  return (
    <Link
      href={`/services/${service.slug}`}
      className="group w-full relative flex flex-col justify-between border border-border p-6 md:p-8 rounded-3xl hover:border-brand-primary/50 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-card"
      aria-labelledby={`title-${service.slug}`}
    >
      <div>
        {/* Header: Icon & Social Proof Badge */}
        <div className="flex items-center justify-between mb-10">
          <div className="w-14 h-14 bg-brand-primary/5 rounded-2xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-500 transform group-hover:rotate-3">
            {iconMap[service.icon as string] || <Code className="w-6 h-6" />}
          </div>

          {/* Social Proof Capsule */}
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 mb-1">
              <span className="text-brand-primary">{proof.icon}</span>
              <span className="text-xs font-bold tracking-tight text-foreground uppercase">
                {proof.label}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
              {proof.sub}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <h3
          id={`title-${service.slug}`}
          className="text-2xl font-bold mb-4 tracking-tight group-hover:text-brand-primary transition-colors duration-300"
        >
          {service.title}
        </h3>

        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-8 line-clamp-3">
          {service.short_desc}
        </p>

        {/* High-Intent Features List */}
        <ul className="space-y-3 mb-10">
          {service.features?.slice(0, 3).map((feature, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm text-muted-foreground"
            >
              <div className="mt-1 shrink-0">
                <CheckCircle2
                  size={16}
                  className="text-brand-primary/60 group-hover:text-brand-primary transition-colors"
                />
              </div>
              <span className="leading-tight">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Conversion Action Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-border/40">
        <span className="text-[11px] font-bold uppercase tracking-widest text-foreground group-hover:text-brand-primary transition-colors">
          View Solution Details
        </span>
        <div className="w-10 h-10 rounded-full bg-brand-primary/5 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
          <ArrowRight
            size={18}
            className="group-hover:translate-x-1 transition-transform duration-300"
          />
        </div>
      </div>
    </Link>
  );
};
