"use client";

import { useEffect, useState } from "react";
import {
  RefreshCcw,
  AlertCircle,
  Settings,
  Bell,
  Rocket,
  MonitorSmartphone,
} from "lucide-react";
import { useUser } from "@/lib/hooks/useauth";
import { federatedLogout } from "@/lib/actions/logout";
import DashboardShell from "@/lib/components/dashboard/DashboardShell";
import {
  type ConsolePreferences,
  loadPreferences,
  savePreferences,
} from "@/lib/settings/preferences";
import { toast } from "sonner";

type ToggleRowProps = {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  icon: React.ComponentType<{ className?: string }>;
};

function ToggleRow({
  id,
  title,
  description,
  checked,
  onChange,
  icon: Icon,
}: ToggleRowProps) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-4 shadow-sm">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="font-medium text-on-surface">
          {title}
        </label>
        <p className="mt-0.5 text-sm text-on-surface-variant">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-surface-container-highest"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

/**
 * N9 Settings — notifications, launch hop preference, shared device.
 */
export default function DashboardSettingsPage() {
  const { user, status: authStatus } = useUser();
  const [prefs, setPrefs] = useState<ConsolePreferences | null>(null);

  useEffect(() => {
    setPrefs(loadPreferences());
  }, []);

  const update = <K extends keyof ConsolePreferences>(
    key: K,
    value: ConsolePreferences[K],
  ) => {
    setPrefs((prev) => {
      const base = prev ?? loadPreferences();
      const next = { ...base, [key]: value };
      savePreferences(next);
      toast.success("Preference saved");
      return next;
    });
  };

  if (authStatus === "loading" || prefs === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (authStatus === "stale" || authStatus === "unauthenticated") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface p-4">
        <div className="max-w-md rounded-xl border border-error-container bg-surface-container-lowest p-8 text-center shadow-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-error" />
          <h2 className="mt-4 text-xl font-bold">Session Expired</h2>
          <button
            type="button"
            onClick={async () => {
              const url = await federatedLogout();
              if (url) window.location.href = url;
            }}
            className="mt-6 w-full rounded-lg bg-primary px-4 py-2 font-semibold text-on-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell title="Settings" user={user}>
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" aria-hidden />
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Settings</h1>
            <p className="text-sm text-on-surface-variant">
              Console preferences for this browser. Server-synced settings can
              follow later.
            </p>
          </div>
        </header>

        <section className="space-y-3" aria-labelledby="notify-heading">
          <h2 id="notify-heading" className="text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
            Notifications
          </h2>
          <ToggleRow
            id="notif-email"
            title="Email notifications"
            description="Billing and security notices to your account email."
            checked={prefs.notificationsEmail}
            onChange={(v) => update("notificationsEmail", v)}
            icon={Bell}
          />
          <ToggleRow
            id="notif-product"
            title="Product updates"
            description="Tips and product news for services you use."
            checked={prefs.notificationsProduct}
            onChange={(v) => update("notificationsProduct", v)}
            icon={Bell}
          />
        </section>

        <section className="space-y-3" aria-labelledby="sso-heading">
          <h2 id="sso-heading" className="text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
            Launch & devices
          </h2>
          <ToggleRow
            id="launch-hop"
            title="Prefer launch hop SSO"
            description="When launching a product, use NetHub exchange (hard session) when available. Requires launch hop to be enabled in the environment."
            checked={prefs.launchHopEnabled}
            onChange={(v) => update("launchHopEnabled", v)}
            icon={Rocket}
          />
          <ToggleRow
            id="shared-device"
            title="Shared device mode"
            description="Optimise for shared terminals (e.g. POS): shorter sessions and terminal principal when exchanging."
            checked={prefs.sharedDeviceMode}
            onChange={(v) => update("sharedDeviceMode", v)}
            icon={MonitorSmartphone}
          />
        </section>
      </div>
    </DashboardShell>
  );
}
