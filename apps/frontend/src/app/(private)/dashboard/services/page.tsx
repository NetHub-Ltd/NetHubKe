"use client";

import { useCallback, useEffect, useState } from "react";
import {
  RefreshCcw,
  AlertCircle,
  Boxes,
  CheckCircle2,
  Clock,
  CircleDashed,
} from "lucide-react";
import { useUser } from "@/lib/hooks/useauth";
import { federatedLogout } from "@/lib/actions/logout";
import DashboardShell from "@/lib/components/dashboard/DashboardShell";
import { useSession } from "next-auth/react";

type ProductStatus = "connected" | "trial" | "not_connected";

type TenantProductStatus = {
  slug: string;
  name: string;
  status: ProductStatus;
  external_org_id?: string | null;
  audience?: string | null;
};

const STATUS_META: Record<
  ProductStatus,
  { label: string; className: string; Icon: typeof CheckCircle2 }
> = {
  connected: {
    label: "Connected",
    className: "bg-tertiary-container text-on-tertiary-container",
    Icon: CheckCircle2,
  },
  trial: {
    label: "Trial",
    className: "bg-secondary-container text-on-secondary-container",
    Icon: Clock,
  },
  not_connected: {
    label: "Not connected",
    className: "bg-surface-container-high text-on-surface-variant",
    Icon: CircleDashed,
  },
};

/**
 * N6 My services — tenant product connection status from backend.
 */
export default function DashboardServicesPage() {
  const { user, status: authStatus } = useUser();
  const { data: session } = useSession();
  const [items, setItems] = useState<TenantProductStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async (signal?: AbortSignal) => {
    const token = (session as { accessToken?: string } | null)?.accessToken;
    const base =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.BACKEND_URL ||
      "";
    const url = `${base.replace(/\/$/, "")}/api/v1/services/my-status`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      signal,
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(body || `HTTP ${res.status}`);
    }
    const data = (await res.json()) as TenantProductStatus[];
    return Array.isArray(data) ? data : [];
  }, [session]);

  // Load when authenticated — setState only after await (no sync setState in effect)
  useEffect(() => {
    if (authStatus !== "authenticated") {
      return;
    }
    const ac = new AbortController();
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchStatus(ac.signal);
        if (cancelled) return;
        setItems(data);
        setError(null);
      } catch (e) {
        if (cancelled || (e instanceof DOMException && e.name === "AbortError")) {
          return;
        }
        setError(e instanceof Error ? e.message : "Failed to load services");
        setItems([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [authStatus, fetchStatus]);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStatus();
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load services");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };


  if (authStatus === "loading") {
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
    <DashboardShell title="My services" user={user}>
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Boxes className="h-8 w-8 text-primary" aria-hidden />
            <div>
              <h1 className="text-2xl font-bold text-on-surface">My services</h1>
              <p className="text-sm text-on-surface-variant">
                Connection status for products linked to your tenant.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-3 py-2 text-sm font-medium text-on-surface hover:bg-surface-container-high"
            disabled={loading}
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-error-container bg-error-container/20 px-4 py-3 text-sm text-on-error-container"
          >
            {error}
          </div>
        )}

        {loading && !items.length ? (
          <p className="text-sm text-on-surface-variant">Loading services…</p>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-outline-variant p-8 text-center text-on-surface-variant">
            <p>No products registered yet.</p>
            <p className="mt-1 text-sm">
              When products are added to NetHub, they will appear here with
              connected / trial / not connected status.
            </p>
          </div>
        ) : null}

        <ul className="space-y-3" aria-label="Service status list">
          {items.map((item) => {
            const meta = STATUS_META[item.status] || STATUS_META.not_connected;
            const Icon = meta.Icon;
            return (
              <li
                key={item.slug}
                className="flex items-center justify-between gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-4 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-on-surface">{item.name}</p>
                  <p className="truncate text-xs text-on-surface-variant">
                    {item.slug}
                    {item.audience ? ` · aud ${item.audience}` : ""}
                  </p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {meta.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </DashboardShell>
  );
}
