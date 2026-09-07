import type { Metadata, Viewport } from "next";

export const viewportConfig: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  width: "device-width",
  initialScale: 1,
};

/**
 * Root metadata baseline for NetHub Kenya.
 * Page-level generateMetadata overrides title/description/canonical as needed.
 */
export const metadataConfig: Metadata = {
  metadataBase: new URL("https://nethub.co.ke"),
  title: {
    default: "NetHub | Software & Web Development Agency in Kenya",
    template: "%s | NetHub Kenya",
  },
  description:
    "NetHub builds high-performance apps and M-Pesa integrations. Expert web design and SEO solutions for Kenyan businesses. Get a quote today.",
  keywords: [
    "M-Pesa API integration services Kenya",
    "Custom software development Nairobi",
    "Lipa Na M-Pesa STK Push setup",
    "Affordable web design packages Kenya",
    "Hire mobile app developers Nairobi",
    "Fintech developers in Kenya",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://nethub.co.ke",
    siteName: "NetHub Kenya",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NetHub - M-Pesa Integrations & Software Development",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@nethub_ke",
    creator: "@nethub_ke",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

/**
 * Organization / professional service schema for the agency.
 * No placeholder aggregate ratings — only real, visible claims.
 */
export const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "NetHub Kenya",
  image: "https://nethub.co.ke/og-image.jpg",
  description:
    "Specialists in M-Pesa API Integration and Custom Software Development in Nairobi, Kenya.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Nairobi",
    addressCountry: "KE",
  },
  areaServed: {
    "@type": "Country",
    name: "Kenya",
  },
  url: "https://nethub.co.ke",
  priceRange: "$$",
};
