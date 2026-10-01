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
import { ServiceRead } from "@/lib/types/api";

const iconMap: Record<string, React.ReactNode> = {
  CreditCard: <CreditCard className="w-6 h-6" />,
  Smartphone: <Smartphone className="w-6 h-6" />,
  Search: <Search className="w-6 h-6" />,
  Wrench: <Code className="w-6 h-6" />,
  Globe: <Globe className="w-6 h-6" />,
  ShoppingBag: <ShoppingBag className="w-6 h-6" />,
};

export const ServiceCard = ({
  service,
}: {
  service: Pick<
    ServiceRead,
    "title" | "short_desc" | "features" | "slug" | "icon"
  >;
}) => {
  const getSocialProof = (slug: string) => {
    if (slug.includes("m-pesa") || slug.includes("payments"))
      return {
        label: "99.9% uptime target",
        sub: "Payment integrations",
        icon: <TrendingUp size={12} />,
      };
    if (slug.includes("web"))
      return {
        label: "Performance-focused",
        sub: "Core Web Vitals",
        icon: <TrendingUp size={12} />,
      };
    if (slug.includes("mobile"))
      return {
        label: "Mobile & web",
        sub: "Cross-platform builds",
        icon: <Users size={12} />,
      };
    if (slug.includes("seo"))
      return {
        label: "Technical SEO",
        sub: "Measurable improvements",
        icon: <TrendingUp size={12} />,
      };
    return {
      label: "Delivery-ready",
      sub: "Scoped engineering",
      icon: <CheckCircle2 size={12} />,
    };
  };

  const proof = getSocialProof(service.slug);

  return (
    <Link
      href={`/services/${service.slug}`}
      className="card-surface group relative flex w-full flex-col justify-between p-space-lg transition-all duration-300 hover:border-primary/40 hover:shadow-lg md:p-space-xl"
      aria-labelledby={`title-${service.slug}`}
    >
      <div>
        <div className="mb-space-lg flex items-center justify-between gap-space-md">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-muted text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
            {iconMap[service.icon as string] || <Code className="w-6 h-6" />}
          </div>
          <div className="text-right">
            <div className="mb-space-2xs flex items-center justify-end gap-space-2xs">
              <span className="text-primary">{proof.icon}</span>
              <span className="font-label-sm text-on-surface">{proof.label}</span>
            </div>
            <p className="font-body-sm text-on-surface-variant">{proof.sub}</p>
          </div>
        </div>

        <h3
          id={`title-${service.slug}`}
          className="font-headline-sm mb-space-sm text-on-surface transition-colors group-hover:text-primary"
        >
          {service.title}
        </h3>

        <p className="font-body-md mb-space-lg line-clamp-3 text-on-surface-variant">
          {service.short_desc}
        </p>

        <ul className="mb-space-lg space-y-space-sm">
          {service.features?.slice(0, 3).map((feature, i) => (
            <li
              key={i}
              className="font-body-sm flex items-start gap-space-sm text-on-surface-variant"
            >
              <CheckCircle2
                size={16}
                className="mt-0.5 shrink-0 text-primary"
                aria-hidden
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between border-t border-border-subtle pt-space-md">
        <span className="font-label-sm text-on-surface group-hover:text-primary">
          View details
        </span>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-muted text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
          <ArrowRight size={18} aria-hidden />
        </span>
      </div>
    </Link>
  );
};
