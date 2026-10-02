import type { Metadata, Viewport } from "next";

const SITE = "https://nethub.co.ke";

export const viewportConfig: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4f46e5" },
    { media: "(prefers-color-scheme: dark)", color: "#312e81" },
  ],
  width: "device-width",
  initialScale: 1,
};

/**
 * Root metadata baseline for NetHub Kenya.
 * Page-level metadata overrides title/description/canonical as needed.
 */
export const metadataConfig: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "NetHub Kenya | Digital infrastructure, M-Pesa & apps",
    template: "%s | NetHub Kenya",
  },
  description:
    "NetHub builds and operates digital infrastructure for Kenyan businesses — M-Pesa integrations, APIs, and modern web applications. Based in Nairobi.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: SITE,
    siteName: "NetHub Kenya",
    title: "NetHub Kenya | Digital infrastructure, M-Pesa & apps",
    description:
      "M-Pesa integrations, APIs, and modern web applications for Kenyan businesses.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NetHub Kenya — digital infrastructure and M-Pesa integrations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@nethub_ke",
    creator: "@nethub_ke",
    title: "NetHub Kenya | Digital infrastructure, M-Pesa & apps",
    description:
      "M-Pesa integrations, APIs, and modern web applications for Kenyan businesses.",
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
 * Organization schema — only claims we can stand behind (no fake ratings).
 */
export const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "NetHub Kenya",
  url: SITE,
  image: `${SITE}/og-image.jpg`,
  description:
    "Digital infrastructure, M-Pesa API integration, and web applications for businesses in Kenya.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Nairobi",
    addressCountry: "KE",
  },
  areaServed: {
    "@type": "Country",
    name: "Kenya",
  },
  sameAs: ["https://x.com/nethub_ke"],
};
