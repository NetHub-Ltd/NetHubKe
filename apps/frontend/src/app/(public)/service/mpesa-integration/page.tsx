import { redirect } from "next/navigation";

/** Legacy path — permanent canonical is /services/mpesa-integration */
export default function LegacyMpesaServicePage() {
  redirect("/services/mpesa-integration");
}
