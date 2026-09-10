import { redirect } from "next/navigation";

/** Legacy route — post-login profile is /dashboard */
export default function WelcomePage() {
  redirect("/dashboard");
}
