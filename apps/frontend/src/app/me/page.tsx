import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

/** Preserve existing bookmarks and links while the account page moves under /dashboard. */
export default function LegacyMePage() {
  redirect("/dashboard/me");
}
