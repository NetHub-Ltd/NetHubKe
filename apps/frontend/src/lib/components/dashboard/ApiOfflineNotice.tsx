"use client";

import { CloudOff } from "lucide-react";
import { Button } from "@/lib/components/ui";

type Props = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retrying?: boolean;
};

/**
 * Calm empty state when BFF/API is unavailable — avoids dumping raw HTTP bodies.
 */
export default function ApiOfflineNotice({
  title = "Not available yet",
  description = "This section needs the NetHub API. Your sign-in still works; data will show here once the backend is connected.",
  onRetry,
  retrying,
}: Props) {
  return (
    <div className="card-surface text-center">
      <CloudOff
        className="mx-auto h-10 w-10 text-on-surface-variant"
        aria-hidden
      />
      <h2 className="font-headline-sm mt-space-md text-on-surface">{title}</h2>
      <p className="font-body-md mx-auto mt-space-sm max-w-md text-on-surface-variant">
        {description}
      </p>
      {onRetry ? (
        <Button
          type="button"
          variant="secondary"
          className="mt-space-lg"
          loading={retrying}
          onClick={onRetry}
        >
          Try again
        </Button>
      ) : null}
    </div>
  );
}
