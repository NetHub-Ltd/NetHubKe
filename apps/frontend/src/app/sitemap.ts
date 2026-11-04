import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://nethub.co.ke").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const serviceRoutes = [\n    "/services/website-development-kenya",\n    "/services/mobile-app-development",\n    "/services/seo-conversion-kenya",\n    "/services/business-technology-solutions",\n  ];\n  const publicRoutes = ["", "/services", "/products", "/about", "/contact", ...serviceRoutes];

  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
