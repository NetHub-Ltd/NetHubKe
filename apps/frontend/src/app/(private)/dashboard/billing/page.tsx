"use client";

import { useCallback, useEffect, useState } from "react";
import {
  RefreshCcw,
  AlertCircle,
  CreditCard,
  FileText,
} from "lucide-react";
import { useUser } from "@/lib/hooks/useauth";
import { federatedLogout } from "@/lib/actions/logout";
import DashboardShell from "@/lib/components/dashboard/DashboardShell";

type PlanRead = {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
};

type SubscriptionRead = {
  id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  plan?: PlanRead | null;
};

type InvoiceRead = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  period_start?: string | null;
  period_end?: string | null;
  issued_at?: string | null;
  paid_at?: string | null;
  description?: string | null;
};

type BillingSummary = {
  subscription?: SubscriptionRead | null;
  invoices: InvoiceRead[];
};

function fmtMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "KES",
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

/**
 * N8 Billing console — plan + invoices (read-only). NetHub is SoR.
 */
export default function DashboardBillingPage() {
  const { user, status: authStatus } = useUser();
  const [data, setData] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async (signal?: AbortSignal) => {
    const res = await fetch("/api/nethub/billing/summary", {
      headers: { Accept: "application/json" },
      credentials: "include",
      signal,
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(body || `HTTP ${res.status}`);
    }
    return (await res.json()) as BillingSummary;
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    const ac = new AbortController();
    let cancelled = false;
    (async () => {
      try {
        const summary = await fetchSummary(ac.signal);
        if (cancelled) return;
        setData(summary);
        setError(null);
      } catch (e) {
        if (cancelled || (e instanceof DOMException && e.name === "AbortError")) {
          return;
        }
        setError(e instanceof Error ? e.message : "Failed to load billing");
        setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [authStatus, fetchSummary]);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchSummary());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load billing");
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

  const sub = data?.subscription;
  const plan = sub?.plan;
  const invoices = data?.invoices ?? [];

  return (
    <DashboardShell title="Billing" user={user}>
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-primary" aria-hidden />
            <div>
              <h1 className="text-2xl font-bold text-on-surface">Billing</h1>
              <p className="text-sm text-on-surface-variant">
                Plan and invoices for your tenant. NetHub is the billing system of
                record. Payments can be added later.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-3 py-2 text-sm font-medium"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </header>

        {error && (
          <div role="alert" className="rounded-lg border border-error-container bg-error-container/20 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <section
          className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm"
          aria-labelledby="plan-heading"
        >
          <h2 id="plan-heading" className="text-lg font-semibold text-on-surface">
            Current plan
          </h2>
          {loading && !data ? (
            <p className="mt-2 text-sm text-on-surface-variant">Loading…</p>
          ) : !sub ? (
            <p className="mt-2 text-sm text-on-surface-variant">
              No active subscription on file. Contact support to choose a plan.
            </p>
          ) : (
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-on-surface-variant">Plan</dt>
                <dd className="font-medium text-on-surface">
                  {plan?.name ?? "Unknown plan"}
                </dd>
              </div>
              <div>
                <dt className="text-on-surface-variant">Status</dt>
                <dd className="font-medium capitalize text-on-surface">{sub.status}</dd>
              </div>
              <div>
                <dt className="text-on-surface-variant">Price</dt>
                <dd className="font-medium text-on-surface">
                  {plan
                    ? `${fmtMoney(plan.price, plan.currency)} / ${plan.interval}`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-on-surface-variant">Current period</dt>
                <dd className="font-medium text-on-surface">
                  {fmtDate(sub.current_period_start)} – {fmtDate(sub.current_period_end)}
                </dd>
              </div>
            </dl>
          )}
        </section>

        <section aria-labelledby="invoices-heading">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" aria-hidden />
            <h2 id="invoices-heading" className="text-lg font-semibold text-on-surface">
              Invoices
            </h2>
          </div>
          {invoices.length === 0 ? (
            <div className="rounded-xl border border-dashed border-outline-variant p-8 text-center text-sm text-on-surface-variant">
              No invoices yet.
            </div>
          ) : (
            <ul className="space-y-2">
              {invoices.map((inv) => (
                <li
                  key={inv.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-sm shadow-sm"
                >
                  <div>
                    <p className="font-medium text-on-surface">
                      {inv.description || `Invoice ${inv.id.slice(0, 8)}…`}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Issued {fmtDate(inv.issued_at)} · {inv.status}
                    </p>
                  </div>
                  <span className="font-semibold text-on-surface">
                    {fmtMoney(inv.amount, inv.currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
