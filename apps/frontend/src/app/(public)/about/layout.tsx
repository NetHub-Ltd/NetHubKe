import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About NetHub Kenya — Software & M-Pesa Engineers in Nairobi",
  description:
    "NetHub is a Nairobi-based software engineering agency specializing in M-Pesa Daraja integrations, custom apps, and high-performance systems for Kenyan businesses.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About NetHub Kenya",
    description:
      "Software engineering and M-Pesa integration specialists headquartered in Nairobi.",
    url: "https://nethub.co.ke/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
