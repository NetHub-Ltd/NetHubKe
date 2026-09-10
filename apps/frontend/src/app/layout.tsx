import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/lib/components/Navbar";
import Footer from "@/lib/components/Footer";
import CookieBanner from "@/lib/components/cookieBanner";
import { Providers } from "@/lib/components/providers";
import { metadataConfig, viewportConfig, jsonLd } from "@/lib/seo";
// Platform SDK stubs per AI Studio web migration guidelines
const Analytics = () => null;
const SpeedInsights = () => null;

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
        {/* Google Fonts Preconnect and Material Symbols Outlined */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Material Symbols is not available via next/font; keep stylesheet link */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        {/* JSON-LD for Organization/Website Schema at Root Level */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col selection:bg-brand-cobalt-light selection:text-primary">
        {/* Skip to Content Link for A11y (WCAG 2.4.1) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 bg-primary text-on-primary px-4 py-2 z-100 rounded shadow-lg"
        >
          Skip to content
        </a>

        <Providers>
          <Navbar />
          {/* Main content wrapper with top padding for fixed header */}
          <main id="main-content" className="grow outline-none pt-16" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <CookieBanner />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
