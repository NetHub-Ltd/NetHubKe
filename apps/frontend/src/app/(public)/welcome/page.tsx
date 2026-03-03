"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") return <p>Loading...</p>;

  return (
    <main style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to Nethub, {session?.user?.name || "User"}!</h1>
      <p>Authentication Successful.</p>

      {/* Sign out of both NextAuth AND Keycloak */}
      <button onClick={() => signOut({ callbackUrl: "/" })}>Logout</button>
    </main>
  );
}
