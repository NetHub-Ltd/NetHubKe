"use client";

import { useState } from "react";
import { oidcLogin } from "@/lib/utils/authClient";
import { Button } from "@/lib/components/ui";

export function LoginButton() {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="button"
      variant="primary"
      size="lg"
      fullWidth
      loading={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await oidcLogin("/dashboard");
        } catch {
          setLoading(false);
        }
      }}
    >
      Continue with NetHub ID
    </Button>
  );
}
