import type { MetadataRoute } from "next";

/**
 * Crawl directives: public marketing allowed; auth/app/api disallowed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/settings",
          "/login",
          "/welcome",
          "/api/",
          "/service/",
        ],
      },
    ],
    sitemap: "https://nethub.co.ke/sitemap.xml",
    host: "https://nethub.co.ke",
  };
}
