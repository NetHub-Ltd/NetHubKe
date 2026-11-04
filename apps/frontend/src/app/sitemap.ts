import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://nethub.co.ke").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const serviceRoutes = [
    "/services/website-development-kenya",
    "/services/mobile-app-development",
    "/services/seo-conversion-kenya",
    "/services/business-technology-solutions",
  ];
  const publicRoutes = ["", "/services", "/products", "/about", "/contact", ...serviceRoutes];

  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
