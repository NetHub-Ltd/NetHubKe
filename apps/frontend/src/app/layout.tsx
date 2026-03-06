import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/lib/components/Navbar";
import Footer from "@/lib/components/Footer";
import CookieBanner from "@/lib/components/cookieBanner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

// Viewport is handled separately in Next.js 14/15
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://nethub.co.ke"),
  title: {
    default: "NetHub | Leading Software & M-Pesa Integration Agency in Kenya",
    template: "%s | NetHub Kenya",
  },
  description:
    "NetHub empowers Kenyan businesses with custom app development, seamless M-Pesa API integrations, SEO optimization, and professional web design.",
  keywords: [
    "M-Pesa API integration services Kenya", // Long-tail (High conversion)
    "Custom software development Nairobi", // Location-based
    "Lipa Na M-Pesa STK Push setup", // Technical/Specific
    "Affordable web design packages Kenya", // Pricing intent
    "Hire mobile app developers Nairobi", // Recruitment/Agency intent
    "NetHub software solutions", // Branded
    "Fintech developers in Kenya", // Niche authority
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
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NetHub - Digital Solutions & M-Pesa Integrations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@nethub_ke", // Add your handle if you have one
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Local SEO: M-Pesa Integration is a high-value keyword in Kenya
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "NetHub Kenya",
    image: "https://nethub.co.ke/og-image.png",
    description:
      "Specialists in M-Pesa API Integration and Software Development in Nairobi, Kenya.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Nairobi",
      addressCountry: "KE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -1.286389,
      longitude: 36.817223,
    },
    url: "https://nethub.co.ke",
  };

  return (
    <html
      lang="en"
      className={`scroll-smooth ${inter.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <Navbar />
        <main id="main-content" className="grow">
          {children}
        </main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
