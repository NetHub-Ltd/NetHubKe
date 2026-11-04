import type { Metadata } from "next";
import { DM_Sans, Poppins } from "next/font/google";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteFooterVisibility } from "@/components/site/SiteFooterVisibility";
import { SiteHeader } from "@/components/site/SiteHeader";
import "./globals.css";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nethub.co.ke";
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "NetHub",
  url: siteUrl,
  description:
    "NetHub helps businesses grow through better digital experiences, software, SEO and practical technology solutions.",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NetHub | Business growth through technology",
    template: "%s | NetHub",
  },
  description:
    "NetHub helps businesses grow through better digital experiences, software, SEO and practical technology solutions.",
  applicationName: "NetHub",
  openGraph: {
    type: "website",
    siteName: "NetHub",
    title: "NetHub | Business growth through technology",
    description:
      "Better digital experiences, smarter systems and technology that moves your business forward.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NetHub | Business growth through technology",
    description:
      "Better digital experiences, smarter systems and technology that moves your business forward.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="flex min-h-screen flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c"),
          }}
        />
        <a
          href="#main-content"
          className="sr-only z-50 rounded-md bg-brand px-4 py-2 text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <SiteHeader />
        <div id="main-content" className="flex-1">{children}</div>
        <SiteFooterVisibility><SiteFooter /></SiteFooterVisibility>
      </body>
    </html>
  );
}
