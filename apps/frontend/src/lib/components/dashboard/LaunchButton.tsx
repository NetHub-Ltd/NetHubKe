"use client";

import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import {
  buildProductRedirectUrl,
  exchangeForProduct,
  isLaunchHopEnabled,
  productLaunchBaseUrl,
} from "@/lib/launch/launchHop";

type LaunchButtonProps = {
  productSlug: string;
  productName: string;
  /** Keycloak access token from NextAuth session */
  accessToken?: string | null;
  disabledReason?: string | null;
};

/**
 * N7: Exchange then redirect into the product app (feature-flagged).
 */
export default function LaunchButton({
  productSlug,
  productName,
  accessToken,
  disabledReason,
}: LaunchButtonProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enabled = isLaunchHopEnabled();
  const launchBase = productLaunchBaseUrl(productSlug);

  if (!enabled) {
    return (
      <span
        className="text-[10px] uppercase tracking-wide text-outline"
        title="Set NEXT_PUBLIC_LAUNCH_HOP_ENABLED=true to enable"
      >
        Launch soon
      </span>
    );
  }

  if (!launchBase) {
    return (
      <span className="text-xs text-on-surface-variant" title="Launch URL not configured">
        No launch URL
      </span>
    );
  }

  const blocked = Boolean(disabledReason) || !accessToken;

  const onLaunch = async () => {
    if (blocked || !accessToken) return;
    setBusy(true);
    setError(null);
    try {
      const exchanged = await exchangeForProduct(productSlug);
      const target = buildProductRedirectUrl(launchBase, exchanged);
      window.location.assign(target);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Launch failed");
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => void onLaunch()}
        disabled={blocked || busy}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-50"
        title={disabledReason || `Open ${productName}`}
      >
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : (
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        )}
        {busy ? "Launching…" : "Launch"}
      </button>
      {error && (
        <p className="max-w-[14rem] text-right text-[11px] text-error" role="alert">
          {error}
        </p>
      )}
      {disabledReason && !error && (
        <p className="max-w-[14rem] text-right text-[11px] text-on-surface-variant">
          {disabledReason}
        </p>
      )}
    </div>
  );
}
