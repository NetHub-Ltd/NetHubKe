import type { MetadataRoute } from "next";

/**
 * Crawl directives for search engines.
 * Public commercial and marketing pages are allowed.
 * Auth, dashboard, and API routes are disallowed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/services", "/services/", "/about", "/contact", "/privacy-policy", "/terms-of-service"],
        disallow: [
          "/dashboard",
          "/settings",
          "/login",
          "/welcome",
          "/api/",
        ],
      },
    ],
    sitemap: "https://nethub.co.ke/sitemap.xml",
    host: "https://nethub.co.ke",
  };
}
