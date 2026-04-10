// import type { Metadata, Viewport } from "next";

// export const viewportConfig: Viewport = {
//   themeColor: [
//     { media: "(prefers-color-scheme: light)", color: "#ffffff" },
//     { media: "(prefers-color-scheme: dark)", color: "#020617" },
//   ],
//   width: "device-width",
//   initialScale: 1,
// };

// export const metadataConfig: Metadata = {
//   metadataBase: new URL("https://nethub.co.ke"),
//   title: {
//     default: "NetHub | Leading Software & Web Development Agency in Kenya",
//     template: "%s | NetHub Kenya",
//   },
//   description:
//     "NetHub empowers Kenyan businesses with custom app development, seamless M-Pesa API integrations, SEO optimization, and professional web design.",
//   keywords: [
//     "M-Pesa API integration services Kenya",
//     "Custom software development Nairobi",
//     "Lipa Na M-Pesa STK Push setup",
//     "Affordable web design packages Kenya",
//     "Hire mobile app developers Nairobi",
//     "NetHub software solutions",
//     "Fintech developers in Kenya",
//   ],
//   alternates: {
//     canonical: "/",
//   },
//   openGraph: {
//     type: "website",
//     locale: "en_KE",
//     url: "https://nethub.co.ke",
//     siteName: "NetHub Kenya",
//     images: [
//       {
//         url: "/og-image.png",
//         width: 1200,
//         height: 630,
//         alt: "NetHub - Digital Solutions & M-Pesa Integrations",
//       },
//     ],
//   },
//   twitter: {
//     card: "summary_large_image",
//     creator: "@nethub_ke",
//   },
//   robots: {
//     index: true,
//     follow: true,
//     googleBot: {
//       index: true,
//       follow: true,
//       "max-video-preview": -1,
//       "max-image-preview": "large",
//       "max-snippet": -1,
//     },
//   },
// };

// export const jsonLd = {
//   "@context": "https://schema.org",
//   "@type": "ProfessionalService",
//   name: "NetHub Kenya",
//   image: "https://nethub.co.ke/og-image.png",
//   description:
//     "Specialists in M-Pesa API Integration and Software Development in Nairobi, Kenya.",
//   address: {
//     "@type": "PostalAddress",
//     addressLocality: "Nairobi",
//     addressCountry: "KE",
//   },
//   geo: {
//     "@type": "GeoCoordinates",
//     latitude: -1.286389,
//     longitude: 36.817223,
//   },
//   url: "https://nethub.co.ke",
// };


import type { Metadata, Viewport } from "next";

export const viewportConfig: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadataConfig: Metadata = {
  metadataBase: new URL("https://nethub.co.ke"),
  title: {
    // Audit: Kept under 60 chars for perfect SERP rendering
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
    canonical: "./", // Absolute path resolution
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://nethub.co.ke",
    siteName: "NetHub Kenya",
    images: [
      {
        url: "/og-image.png",
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
};

export const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication", // Switched to SoftwareApplication for better rich snippets
  applicationCategory: "BusinessApplication",
  name: "NetHub Kenya",
  operatingSystem: "Web, Android, iOS",
  image: "https://nethub.co.ke/og-image.png",
  description:
    "Specialists in M-Pesa API Integration and Custom Software in Nairobi.",
  offers: {
    "@type": "Offer",
    priceCurrency: "KES",
    availability: "https://schema.org/InStock",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    reviewCount: "24", // Placeholder: replace with real stats for rich snippet stars
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Nairobi",
    addressCountry: "KE",
  },
  url: "https://nethub.co.ke",
};