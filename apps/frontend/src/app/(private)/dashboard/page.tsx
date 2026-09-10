import { redirect } from "next/navigation";

/**
 * /dashboard index redirects to the default Profile view.
 */
export default function DashboardIndex() {
  redirect("/dashboard/profile");
}
