import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://nethub.co.ke").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = ["", "/services", "/products", "/about", "/contact"];

  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
