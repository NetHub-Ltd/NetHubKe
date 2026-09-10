"use client";

import React, { useState } from "react";
import Link from "next/link";

const codeSnippets = {
  typescript: `import { DarajaClient } from "@nethub/daraja-sdk";

export async function POST(request: Request) {
  const daraja = new DarajaClient({
    consumerKey: process.env.DARAJA_CONSUMER_KEY!,
    consumerSecret: process.env.DARAJA_CONSUMER_SECRET!,
    passkey: process.env.DARAJA_PASSKEY!,
    shortCode: process.env.DARAJA_SHORTCODE!,
    environment: "production",
  });

  const { phone, amount, reference } = await request.json();

  // Trigger Sub-Second STK Push
  const response = await daraja.stkPush({
    phoneNumber: phone,
    amount,
    accountReference: reference,
    transactionDesc: "Enterprise Order Checkout",
    callbackUrl: "https://api.nethub.co.ke/v1/payments/callback",
  });

  return Response.json({
    status: "PENDING_CUSTOMER_PIN",
    checkoutRequestId: response.CheckoutRequestID,
    timestamp: new Date().toISOString(),
  });
}`,
  python: `from fastapi import FastAPI, HTTPException
from nethub_daraja import DarajaClient, STKPushRequest
import os

app = FastAPI()
daraja = DarajaClient(
    consumer_key=os.getenv("DARAJA_CONSUMER_KEY"),
    consumer_secret=os.getenv("DARAJA_CONSUMER_SECRET"),
    passkey=os.getenv("DARAJA_PASSKEY"),
    shortcode=os.getenv("DARAJA_SHORTCODE"),
    env="production"
)

@app.post("/api/v1/checkout/stk")
async def initiate_stk(phone: str, amount: float, ref: str):
    res = await daraja.stk_push(
        STKPushRequest(
            phone_number=phone,
            amount=amount,
            account_reference=ref,
            callback_url="https://api.nethub.co.ke/v1/payments/callback"
        )
    )
    return {"status": "SUCCESS", "checkout_request_id": res.checkout_request_id}`,
  go: `package main

import (
    "github.com/gofiber/fiber/v2"
    "github.com/nethub/daraja-go/v3"
    "os"
)

func main() {
    client := daraja.NewClient(&daraja.Config{
        ConsumerKey:    os.Getenv("DARAJA_KEY"),
        ConsumerSecret: os.Getenv("DARAJA_SECRET"),
        Passkey:        os.Getenv("DARAJA_PASSKEY"),
        ShortCode:      os.Getenv("DARAJA_SHORTCODE"),
    })

    app := fiber.New()
    app.Post("/api/stk", func(c *fiber.Ctx) error {
        resp, err := client.InitiateSTK(c.Context(), &daraja.STKParams{
            PhoneNumber: c.FormValue("phone"),
            Amount:      1000,
            CallbackURL: "https://api.nethub.co.ke/v1/payments/callback",
        })
        if err != nil {
            return c.Status(500).JSON(fiber.Map{"error": err.Error()})
        }
        return c.JSON(resp)
    })
    app.Listen(":3000")
}`,
};

const darajaFaqs = [
  {
    id: 1,
    question: "What is the primary difference between Daraja 2.0 and Daraja 3.0?",
    answer:
      "Daraja 3.0 introduces enhanced OAuth2 token rotation with reduced token acquisition overhead, high-frequency rate limit buffers (up to 1,000 req/sec on dedicated enterprise queues), asynchronous webhook signature verification with HMAC-SHA256, and instant STK push query status resolution.",
  },
  {
    id: 2,
    question: "How does NetHub ensure zero lost callbacks during M-Pesa network outages?",
    answer:
      "We implement an enterprise event-driven idempotent message queue powered by Redis and RabbitMQ. In the event of network timeouts or dropped Safaricom webhooks, our fallback engine automatically initiates exponential backoff re-queries against the Safaricom Ledger endpoint to reconcile transaction status within 90 seconds.",
  },
  {
    id: 3,
    question: "How long does it take to migrate from Sandbox to Safaricom Production?",
    answer:
      "Because our infrastructure codebase meets all Safaricom Security Baseline requirements out-of-the-box (including IP whitelisting, TLS 1.3 termination, and data residency compliance), the standard migration takes 48 to 72 business hours.",
  },
];

export default function MpesaIntegrationPage() {
  const [selectedLang, setSelectedLang] = useState<"typescript" | "python" | "go">("typescript");
  const [openFaq, setOpenFaq] = useState<number | null>(1);
  const [copied, setCopied] = useState(false);
  const [simulatedPhone, setSimulatedPhone] = useState("254712345678");
  const [simulatedAmount, setSimulatedAmount] = useState("1,500");
  const [simState, setSimState] = useState<"idle" | "sending" | "success">("idle");

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[selectedLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    setSimState("sending");
    setTimeout(() => {
      setSimState("success");
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full bg-surface">
      {/* Hero Section */}
      <section className="relative w-full bg-surface-canvas overflow-hidden pt-space-3xl pb-space-4xl">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -top-32 right-0 w-[540px] h-[540px] bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-20 w-[420px] h-[420px] bg-secondary-container/40 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop relative z-10">
          {/* Breadcrumb & Telemetry Marker */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-xl">
            <div className="flex items-center gap-space-xs text-slate-text-muted font-body-sm text-body-sm">
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/services" className="hover:text-primary transition-colors">
                Services
              </Link>
              <span>/</span>
              <span className="text-on-surface font-semibold">Daraja 3.0 M-Pesa</span>
            </div>
            <div className="inline-flex items-center gap-space-xs bg-success-emerald-bg px-space-md py-space-2xs rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-emerald opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success-emerald"></span>
              </span>
              <span className="font-metric-mono text-metric-mono text-tertiary font-bold">
                Safaricom Daraja 3.0 Certified Partner Node
              </span>
            </div>
          </div>

          {/* Heading and Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl items-center mb-space-3xl">
            <div className="lg:col-span-7 flex flex-col gap-space-md">
              <div className="inline-flex items-center gap-space-xs bg-brand-cobalt-light px-space-md py-space-2xs rounded-full w-fit">
                <span className="font-metric-mono text-metric-mono text-primary font-bold tracking-widest uppercase">
                  FINANCIAL RAILS ARCHITECTURE
                </span>
              </div>
              <h1 className="font-display-xl text-display-xl text-on-surface tracking-tight font-extrabold">
                Enterprise Daraja 3.0 <br className="hidden sm:inline" />
                <span className="text-primary-container">M-Pesa Systems Architecture.</span>
              </h1>
              <p className="font-body-lg text-body-lg text-slate-text-muted leading-relaxed">
                High-throughput financial rails built for Kenya&apos;s leading
                e-commerce platforms, SACCOs, and digital lenders. Zero failed
                callbacks, automated reconciliation, and 99.99% uptime SLA.
              </p>

              {/* Telemetry Stats Strip */}
              <div className="grid grid-cols-3 gap-space-md pt-space-md border-t border-border-subtle mt-space-sm">
                <div>
                  <span className="font-display-lg text-display-lg text-on-surface font-extrabold block">
                    450ms
                  </span>
                  <span className="font-body-sm text-body-sm text-slate-text-muted">
                    Average STK Latency
                  </span>
                </div>
                <div>
                  <span className="font-display-lg text-display-lg text-on-surface font-extrabold block">
                    99.99%
                  </span>
                  <span className="font-body-sm text-body-sm text-slate-text-muted">
                    Gateway Availability
                  </span>
                </div>
                <div>
                  <span className="font-display-lg text-display-lg text-on-surface font-extrabold block">
                    10M+
                  </span>
                  <span className="font-body-sm text-body-sm text-slate-text-muted">
                    Daily KSh Volume
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-space-md pt-space-md">
                <Link
                  href="/contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center font-label-md text-label-md text-on-primary bg-primary-container hover:bg-brand-cobalt-hover px-space-xl py-space-sm rounded-lg shadow-md transition-all font-semibold"
                >
                  <span>Initiate Gateway Integration</span>
                  <span className="material-symbols-outlined text-[18px] ml-space-xs">
                    arrow_forward
                  </span>
                </Link>
                <Link
                  href="/schedule"
                  className="w-full sm:w-auto inline-flex items-center justify-center font-label-md text-label-md text-on-surface bg-surface-canvas hover:bg-surface-subtle px-space-xl py-space-sm rounded-lg shadow-sm transition-all font-semibold"
                >
                  <span>Book Architecture Review</span>
                </Link>
              </div>
            </div>

            {/* Interactive Sandbox Simulator Terminal */}
            <div className="lg:col-span-5 bg-inverse-surface text-inverse-on-surface rounded-xl shadow-xl overflow-hidden border border-slate-700">
              <div className="bg-slate-900/90 px-space-md py-space-sm border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  <span className="ml-2 font-metric-mono text-metric-mono text-slate-400">
                    daraja-v3-stk-simulator
                  </span>
                </div>
                <span className="font-metric-mono text-[10px] text-success-emerald bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  LIVE RAILS
                </span>
              </div>

              <div className="p-space-lg font-mono text-xs">
                <form onSubmit={handleSimulate} className="space-y-space-sm mb-space-md">
                  <div>
                    <label className="block text-slate-400 font-label-sm text-[11px] mb-1">
                      Customer MSISDN (Phone)
                    </label>
                    <input
                      type="text"
                      value={simulatedPhone}
                      onChange={(e) => setSimulatedPhone(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-700 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-label-sm text-[11px] mb-1">
                      Amount (KES)
                    </label>
                    <input
                      type="text"
                      value={simulatedAmount}
                      onChange={(e) => setSimulatedAmount(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-700 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={simState === "sending"}
                    className="w-full bg-primary hover:bg-brand-cobalt-hover text-white font-sans font-semibold py-2 rounded transition-all text-xs flex items-center justify-center gap-2"
                  >
                    {simState === "sending" ? (
                      <>
                        <span className="animate-spin material-symbols-outlined text-[16px]">
                          progress_activity
                        </span>
                        <span>Dispatching STK to Safaricom Rails...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">
                          send
                        </span>
                        <span>Test STK Push Dispatch</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Simulated Terminal Log Output */}
                <div className="bg-slate-950 p-space-sm rounded border border-slate-800 space-y-1 text-slate-300">
                  <div className="text-slate-500">
                    {/* Automated Gateway Handshake Log */}
                  </div>
                  <div>
                    <span className="text-emerald-400">[200 OK]</span> OAuth2 Bearer
                    Token Acquired (ttl: 3599s)
                  </div>
                  {simState === "sending" && (
                    <div className="text-yellow-400 animate-pulse">
                      &gt; POST /mpesa/stkpush/v3/processrequest HTTP/2...
                    </div>
                  )}
                  {simState === "success" && (
                    <>
                      <div className="text-blue-400">
                        &gt; STK Push Handshake: Safaricom Mobile Node ACK
                      </div>
                      <div className="text-emerald-400">
                        ✓ CheckoutRequestID: ws_CO_08092026_982314
                      </div>
                      <div className="text-emerald-300">
                        ✓ ResponseCode: 0 (&quot;Success. Request accepted for
                        processing&quot;)
                      </div>
                      <div className="text-slate-400 text-[10px] mt-1 pt-1 border-t border-slate-800">
                        Simulated latency: 412ms • Idempotent Key Verified
                      </div>
                    </>
                  )}
                  {simState === "idle" && (
                    <div className="text-slate-500 text-[11px]">
                      Awaiting trigger. Click above to test sub-second STK push.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architectural Capabilities Bento Grid */}
      <section className="w-full bg-surface py-space-4xl">
        <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="max-w-2xl mb-space-2xl">
            <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
              FINTECH ENGINEERING EXCELLENCE
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight mt-space-xs">
              Mission-Critical Payment Infrastructure
            </h2>
            <p className="font-body-md text-body-md text-slate-text-muted mt-space-xs">
              Engineered from the ground up to prevent dropped orders, transaction
              mismatches, and reconciliation bottlenecks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-lg">
            {/* Bento Card 1 */}
            <div className="bg-surface-canvas p-space-xl rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-transparent hover:border-primary/20">
              <div>
                <div className="w-12 h-12 rounded-lg bg-brand-cobalt-light flex items-center justify-center text-primary mb-space-lg">
                  <span className="material-symbols-outlined text-[28px]">
                    phonelink_ring
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-xs">
                  Sub-Second STK Push
                </h3>
                <p className="font-body-sm text-body-sm text-slate-text-muted leading-relaxed">
                  Triggers customer SIM popups with pre-filled billing references in
                  under 500ms. Supports automatic query retry if customer PIN entry is
                  delayed.
                </p>
              </div>
              <div className="mt-space-lg pt-space-md border-t border-border-subtle flex items-center gap-space-xs text-primary font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                <span>Optimized Callback Fallback</span>
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className="bg-surface-canvas p-space-xl rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-transparent hover:border-primary/20">
              <div>
                <div className="w-12 h-12 rounded-lg bg-success-emerald-bg flex items-center justify-center text-tertiary mb-space-lg">
                  <span className="material-symbols-outlined text-[28px]">
                    receipt_long
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-xs">
                  Automated C2B Reconciliation
                </h3>
                <p className="font-body-sm text-body-sm text-slate-text-muted leading-relaxed">
                  Real-time validation and confirmation handlers for Paybill and Till
                  numbers. Auto-credits user wallets and updates order status
                  instantaneously.
                </p>
              </div>
              <div className="mt-space-lg pt-space-md border-t border-border-subtle flex items-center gap-space-xs text-tertiary font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[18px]">
                  sync_alt
                </span>
                <span>Zero Manual Verification</span>
              </div>
            </div>

            {/* Bento Card 3 */}
            <div className="bg-surface-canvas p-space-xl rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-transparent hover:border-primary/20">
              <div>
                <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary mb-space-lg">
                  <span className="material-symbols-outlined text-[28px]">
                    send_money
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-xs">
                  B2C Bulk Disbursements
                </h3>
                <p className="font-body-sm text-body-sm text-slate-text-muted leading-relaxed">
                  Automated payout engines for salary distribution, vendor settlements,
                  and affiliate commissions with queue-based transaction throttling.
                </p>
              </div>
              <div className="mt-space-lg pt-space-md border-t border-border-subtle flex items-center gap-space-xs text-primary font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[18px]">
                  account_tree
                </span>
                <span>Concurrent Payout Queue</span>
              </div>
            </div>

            {/* Bento Card 4 */}
            <div className="bg-surface-canvas p-space-xl rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-transparent hover:border-primary/20">
              <div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-space-lg">
                  <span className="material-symbols-outlined text-[28px]">
                    lock
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-xs">
                  Encrypted Security &amp; Audit
                </h3>
                <p className="font-body-sm text-body-sm text-slate-text-muted leading-relaxed">
                  HMAC-SHA256 signature validation on every webhook, IP whitelisting
                  against Safaricom gateway CIDR blocks, and full tamper-proof audit
                  logs.
                </p>
              </div>
              <div className="mt-space-lg pt-space-md border-t border-border-subtle flex items-center gap-space-xs text-primary font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[18px]">
                  verified_user
                </span>
                <span>PCI-DSS Compliant Rails</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Code Implementation Showcase Section */}
      <section className="w-full bg-surface-canvas py-space-4xl">
        <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg mb-space-2xl">
            <div>
              <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
                DEVELOPER FIRST INTEGRATION
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight mt-space-xs">
                Clean, Production-Ready Code
              </h2>
              <p className="font-body-md text-body-md text-slate-text-muted mt-space-xs">
                Drop-in SDKs and idiomatic templates for your language of choice.
              </p>
            </div>

            {/* Language Switcher Tabs */}
            <div className="flex items-center bg-surface-subtle p-1 rounded-lg border border-border-subtle shrink-0">
              <button
                type="button"
                onClick={() => setSelectedLang("typescript")}
                className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-all ${
                  selectedLang === "typescript"
                    ? "bg-surface-canvas text-primary font-bold shadow-xs"
                    : "text-slate-text-muted hover:text-on-surface"
                }`}
              >
                TypeScript / Next.js
              </button>
              <button
                type="button"
                onClick={() => setSelectedLang("python")}
                className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-all ${
                  selectedLang === "python"
                    ? "bg-surface-canvas text-primary font-bold shadow-xs"
                    : "text-slate-text-muted hover:text-on-surface"
                }`}
              >
                Python / FastAPI
              </button>
              <button
                type="button"
                onClick={() => setSelectedLang("go")}
                className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-all ${
                  selectedLang === "go"
                    ? "bg-surface-canvas text-primary font-bold shadow-xs"
                    : "text-slate-text-muted hover:text-on-surface"
                }`}
              >
                Go / Fiber
              </button>
            </div>
          </div>

          {/* Code Viewer Box */}
          <div className="relative bg-inverse-surface text-inverse-on-surface rounded-xl shadow-lg overflow-hidden border border-slate-800">
            <div className="bg-slate-900/90 px-space-md py-space-sm border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
                <span className="font-metric-mono text-metric-mono text-slate-400">
                  {selectedLang === "typescript"
                    ? "src/app/api/daraja/stk/route.ts"
                    : selectedLang === "python"
                    ? "app/payments/daraja.py"
                    : "cmd/gateway/main.go"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 font-label-sm text-slate-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copied ? "check" : "content_copy"}
                </span>
                <span>{copied ? "Copied" : "Copy Code"}</span>
              </button>
            </div>
            <pre className="p-space-lg font-mono text-xs overflow-x-auto leading-relaxed text-slate-200">
              <code>{codeSnippets[selectedLang]}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Architecture Workflow Timeline */}
      <section className="w-full bg-surface py-space-4xl">
        <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="max-w-2xl mb-space-2xl">
            <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
              DEPLOYMENT ROADMAP
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight mt-space-xs">
              From Sandbox to Safaricom Production Queue
            </h2>
            <p className="font-body-md text-body-md text-slate-text-muted mt-space-xs">
              A disciplined 4-stage engineering methodology designed for zero
              downtime and strict compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-lg">
            <div className="bg-surface-canvas p-space-xl rounded-xl shadow-sm flex flex-col">
              <span className="font-metric-mono text-metric-mono text-primary font-bold mb-space-sm">
                STAGE 01
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-xs">
                Architecture Audit
              </h3>
              <p className="font-body-sm text-body-sm text-slate-text-muted leading-relaxed">
                Review of business model (Till vs Paybill vs B2C), expected TPS
                loads, and reconciliation ledger requirements.
              </p>
            </div>

            <div className="bg-surface-canvas p-space-xl rounded-xl shadow-sm flex flex-col">
              <span className="font-metric-mono text-metric-mono text-primary font-bold mb-space-sm">
                STAGE 02
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-xs">
                Sandbox Validation
              </h3>
              <p className="font-body-sm text-body-sm text-slate-text-muted leading-relaxed">
                Unit test simulation of edge cases: customer cancellation,
                insufficient funds, timeout callbacks, and IPN queue replay.
              </p>
            </div>

            <div className="bg-surface-canvas p-space-xl rounded-xl shadow-sm flex flex-col">
              <span className="font-metric-mono text-metric-mono text-primary font-bold mb-space-sm">
                STAGE 03
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-xs">
                Production Go-Live
              </h3>
              <p className="font-body-sm text-body-sm text-slate-text-muted leading-relaxed">
                Safaricom production credentials mapping, IP whitelisting, KYC
                verification, and initial live KES 10 test transaction verification.
              </p>
            </div>

            <div className="bg-surface-canvas p-space-xl rounded-xl shadow-sm flex flex-col">
              <span className="font-metric-mono text-metric-mono text-primary font-bold mb-space-sm">
                STAGE 04
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-xs">
                24/7 SLA Telemetry
              </h3>
              <p className="font-body-sm text-body-sm text-slate-text-muted leading-relaxed">
                Real-time monitoring on latency, success rates, dropped webhooks,
                and automated instant alerting to Sentry &amp; Datadog.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Packages Strip */}
      <section className="w-full bg-surface-canvas py-space-4xl">
        <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="max-w-2xl mb-space-2xl">
            <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
              PRICING &amp; PACKAGES
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight mt-space-xs">
              Transparent Engineering Tiers
            </h2>
            <p className="font-body-md text-body-md text-slate-text-muted mt-space-xs">
              Fixed-price architectures with no hidden maintenance surcharges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-xl">
            {/* Tier 1 */}
            <div className="bg-surface p-space-xl rounded-xl shadow-sm flex flex-col justify-between border border-border-subtle">
              <div>
                <span className="font-metric-mono text-metric-mono text-slate-text-muted font-bold block mb-space-xs">
                  STARTER STK GATEWAY
                </span>
                <div className="flex items-baseline gap-1 mb-space-sm">
                  <span className="font-display-lg text-display-lg text-on-surface font-extrabold">
                    KSh 45,000
                  </span>
                  <span className="font-body-sm text-body-sm text-slate-text-muted">
                    one-time
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-slate-text-muted mb-space-lg">
                  Ideal for modern e-commerce stores requiring reliable STK Push checkout.
                </p>
                <ul className="space-y-space-xs font-body-sm text-body-sm text-on-surface mb-space-xl">
                  <li className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-success-emerald text-[18px]">
                      check
                    </span>
                    <span>Sub-second STK Push Gateway</span>
                  </li>
                  <li className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-success-emerald text-[18px]">
                      check
                    </span>
                    <span>Automated Status Query Fallback</span>
                  </li>
                  <li className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-success-emerald text-[18px]">
                      check
                    </span>
                    <span>Sandbox to Prod Onboarding</span>
                  </li>
                  <li className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-success-emerald text-[18px]">
                      check
                    </span>
                    <span>30 Days Post-Launch SLA Warranty</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/contact"
                className="w-full inline-flex items-center justify-center font-label-md text-label-md text-on-surface bg-surface-canvas hover:bg-surface-subtle py-space-sm rounded-lg shadow-sm transition-all font-semibold"
              >
                Select Starter Gateway
              </Link>
            </div>

            {/* Tier 2 (Featured) */}
            <div className="bg-surface-canvas p-space-xl rounded-xl shadow-md flex flex-col justify-between border-2 border-primary relative">
              <div className="absolute -top-3 right-4 bg-primary text-on-primary font-metric-mono text-[10px] uppercase font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <div>
                <span className="font-metric-mono text-metric-mono text-primary font-bold block mb-space-xs">
                  ENTERPRISE FINANCIAL HUB
                </span>
                <div className="flex items-baseline gap-1 mb-space-sm">
                  <span className="font-display-lg text-display-lg text-on-surface font-extrabold">
                    KSh 95,000
                  </span>
                  <span className="font-body-sm text-body-sm text-slate-text-muted">
                    one-time
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-slate-text-muted mb-space-lg">
                  Full multi-rail financial switch for high-volume platforms and marketplaces.
                </p>
                <ul className="space-y-space-xs font-body-sm text-body-sm text-on-surface mb-space-xl">
                  <li className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-success-emerald text-[18px]">
                      check
                    </span>
                    <span>STK Push + C2B + B2C Bulk Rails</span>
                  </li>
                  <li className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-success-emerald text-[18px]">
                      check
                    </span>
                    <span>Redis-Backed Idempotent Callback Queue</span>
                  </li>
                  <li className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-success-emerald text-[18px]">
                      check
                    </span>
                    <span>Automated Accounting Ledger Reconciliation</span>
                  </li>
                  <li className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-success-emerald text-[18px]">
                      check
                    </span>
                    <span>90 Days 24/7 Emergency Hot-Fix SLA</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/contact"
                className="w-full inline-flex items-center justify-center font-label-md text-label-md text-on-primary bg-primary-container hover:bg-brand-cobalt-hover py-space-sm rounded-lg shadow-md transition-all font-semibold"
              >
                Deploy Enterprise Hub
              </Link>
            </div>

            {/* Tier 3 */}
            <div className="bg-surface p-space-xl rounded-xl shadow-sm flex flex-col justify-between border border-border-subtle">
              <div>
                <span className="font-metric-mono text-metric-mono text-slate-text-muted font-bold block mb-space-xs">
                  CUSTOM BANKING ENGINE
                </span>
                <div className="flex items-baseline gap-1 mb-space-sm">
                  <span className="font-display-lg text-display-lg text-on-surface font-extrabold">
                    KSh 180,000+
                  </span>
                  <span className="font-body-sm text-body-sm text-slate-text-muted">
                    scope-based
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-slate-text-muted mb-space-lg">
                  Designed for SACCOs, microfinance, and multi-tenant SaaS providers.
                </p>
                <ul className="space-y-space-xs font-body-sm text-body-sm text-on-surface mb-space-xl">
                  <li className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-success-emerald text-[18px]">
                      check
                    </span>
                    <span>Multi-Shortcode Dynamic Routing</span>
                  </li>
                  <li className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-success-emerald text-[18px]">
                      check
                    </span>
                    <span>KRA eTIMS Real-Time Tax Reporting API</span>
                  </li>
                  <li className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-success-emerald text-[18px]">
                      check
                    </span>
                    <span>Dedicated Bare-Metal / Cloud VPC Pod</span>
                  </li>
                  <li className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-success-emerald text-[18px]">
                      check
                    </span>
                    <span>Annual Dedicated Engineering Retainer</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/schedule"
                className="w-full inline-flex items-center justify-center font-label-md text-label-md text-on-surface bg-surface-canvas hover:bg-surface-subtle py-space-sm rounded-lg shadow-sm transition-all font-semibold"
              >
                Consult on Banking Rails
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Technical FAQ Section */}
      <section className="w-full bg-surface-subtle py-space-4xl">
        <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="max-w-2xl mb-space-2xl">
            <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
              TECHNICAL CLARIFICATIONS
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight mt-space-xs">
              M-Pesa Architecture FAQs
            </h2>
            <p className="font-body-md text-body-md text-slate-text-muted mt-space-xs">
              Direct technical answers from our payment engineers.
            </p>
          </div>

          <div className="flex flex-col gap-space-md max-w-3xl">
            {darajaFaqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-surface-canvas rounded-xl shadow-sm overflow-hidden"
                >
                  <button
                    className="w-full text-left p-space-xl flex items-center justify-between gap-space-md hover:bg-surface-subtle/50 transition-colors"
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    type="button"
                  >
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      {faq.question}
                    </span>
                    <span
                      className={`material-symbols-outlined text-primary text-[24px] transform transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-space-xl pb-space-xl pt-0 text-slate-text-muted font-body-md text-body-md leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* High-Conversion Bottom CTA Banner */}
      <section className="w-full bg-surface-canvas py-space-4xl">
        <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="relative bg-surface-muted p-space-2xl md:p-space-3xl rounded-xl shadow-sm overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-space-2xl">
            <div className="relative z-10 max-w-xl flex flex-col gap-space-sm text-center lg:text-left">
              <span className="font-metric-mono text-metric-mono text-primary font-bold uppercase tracking-wider">
                COMMENCE IMPLEMENTATION
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
                Ready to deploy bank-grade M-Pesa infrastructure?
              </h2>
              <p className="font-body-md text-body-md text-slate-text-muted">
                Connect your business to Safaricom&apos;s latest Daraja 3.0 API
                with guaranteed sub-second latency and zero dropped callbacks.
              </p>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-space-md shrink-0 w-full sm:w-auto">
              <Link
                className="w-full sm:w-auto inline-flex items-center justify-center font-label-md text-label-md text-on-primary bg-primary-container hover:bg-brand-cobalt-hover px-space-xl py-space-sm rounded-lg shadow-md transition-all font-semibold"
                href="/contact"
              >
                <span>Start Project Intake</span>
                <span className="material-symbols-outlined text-[18px] ml-space-xs">
                  arrow_forward
                </span>
              </Link>
              <Link
                className="w-full sm:w-auto inline-flex items-center justify-center font-label-md text-label-md text-on-surface bg-surface-canvas hover:bg-surface-subtle px-space-xl py-space-sm rounded-lg shadow-sm transition-all font-semibold"
                href="/schedule"
              >
                <span>Schedule Architecture Call</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
