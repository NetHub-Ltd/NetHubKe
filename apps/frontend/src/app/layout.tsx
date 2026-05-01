import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/lib/components/Navbar";
import Footer from "@/lib/components/Footer";
import CookieBanner from "@/lib/components/cookieBanner";
import { Providers } from "@/lib/components/providers";
import { metadataConfig, viewportConfig, jsonLd } from "@/lib/seo";
import { Analytics } from "@vercel/analytics/next";

// 1. Optimization: Use display: "swap" and preload for LCP/CLS stability
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

export const viewport = viewportConfig;
export const metadata = metadataConfig;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`scroll-smooth ${inter.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* JSON-LD for Organization/Website Schema at Root Level */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col selection:bg-primary/20">
        {/* Skip to Content Link for A11y (WCAG 2.4.1) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 bg-brand-primary px-4 py-2 z-100 border shadow-lg"
        >
          Skip to content
        </a>

        <Providers>
          <Navbar />
          {/* Ensure main-content is the direct child for landmark focus */}
          <main id="main-content" className="grow outline-none" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <CookieBanner />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
