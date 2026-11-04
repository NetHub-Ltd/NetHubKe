import type { MetadataRoute } from "next";
import { siteServices } from "@/content/site-services";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://nethub.co.ke").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const serviceRoutes = siteServices.map((service) => `/services/${service.slug}`);
  const publicRoutes = ["", "/services", "/products", "/about", "/contact", ...serviceRoutes];

  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
