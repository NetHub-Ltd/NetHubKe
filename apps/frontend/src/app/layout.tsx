import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NetHub",
  description: "NetHubKe — Architecture A client (BFF)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
