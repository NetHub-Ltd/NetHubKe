import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./lib/components/Navbar";
import Footer from "./lib/components/Footer";
import CookieBanner from "./lib/components/cookieBanner";

// Inter is more professional for Agency/SaaS sites than Geist
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

export const metadata: Metadata = {
  metadataBase: new URL("https://nethub.co.ke"),
  title: {
    default: "NetHub | Leading Software & M-Pesa Integration Agency in Kenya",
    template: "%s | NetHub Kenya",
  },
  description:
    "NetHub empowers Kenyan businesses with custom app development, seamless M-Pesa API integrations, SEO optimization, and professional web design. Build your digital future today.",
  keywords: [
    "M-Pesa Integration Kenya",
    "App Development Nairobi",
    "Software Engineering Kenya",
    "Lipa Na M-Pesa API setup",
    "Web Design Kenya",
    "NetHub Digital Solutions",
    "SEO Services Nairobi",
  ],
  authors: [{ name: "NetHub Team" }],
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://nethub.co.ke",
    siteName: "NetHub Kenya",
    images: [
      {
        url: "/og-image.jpg", // Make sure to create a high-quality preview image
        width: 1200,
        height: 630,
        alt: "NetHub - Digital Solutions & M-Pesa Integrations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NetHub | Custom Software & Fintech Solutions Kenya",
    description:
      "Scale your business with Kenya's experts in M-Pesa integration and mobile app development.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${mono.variable} font-sans antialiased bg-background text-foreground`}
      >
        {/* You can add a global Navbar/Footer here later */}
        <Navbar />
        <main>{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
