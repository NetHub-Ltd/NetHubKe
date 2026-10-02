/** Build BreadcrumbList JSON-LD (Google rich results). */
export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
  origin = "https://nethub.co.ke",
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.path.startsWith("http")
        ? item.path
        : `${origin}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
    })),
  };
}

/** FAQPage JSON-LD from Q&A pairs already shown on the page. */
export function faqPageJsonLd(faqs: { q: string; a: string }[]) {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };
}
