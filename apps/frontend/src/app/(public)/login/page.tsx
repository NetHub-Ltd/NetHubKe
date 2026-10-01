"use client";

import React from "react";
import { LoginButton } from "@/lib/components/loginButton";
import { ShieldCheck, Cpu, Zap } from "lucide-react";
import { oidcRegister } from "@/lib/utils/authClient";
import Link from "next/link";

const features = [
  {
    icon: ShieldCheck,
    title: "Enterprise-grade security",
    body: "OIDC sign-in with modern token hygiene and protected product access.",
  },
  {
    icon: Cpu,
    title: "Infrastructure you can trust",
    body: "APIs, M-Pesa flows, and apps designed for Kenyan production workloads.",
  },
  {
    icon: Zap,
    title: "Fast, reliable access",
    body: "One account to reach your NetHub console and connected products.",
  },
];

export default function LoginPage() {
  return (
    <div className="container-page flex min-h-[calc(100vh-8rem)] items-center py-space-xl">
      <div className="card-surface mx-auto grid w-full max-w-5xl gap-space-xl p-space-lg md:grid-cols-2 md:p-space-2xl">
        <div className="flex flex-col justify-center gap-space-lg">
          <div>
            <p className="font-label-sm text-primary mb-space-xs">NetHub Kenya</p>
            <h1 className="font-headline-lg text-on-surface mb-space-sm">
              Secure access to your infrastructure
            </h1>
            <p className="font-body-md text-on-surface-variant">
              Sign in to manage services, launches, and account settings — built
              for performance and trust.
            </p>
          </div>
          <ul className="flex flex-col gap-space-md">
            {features.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-space-sm">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-muted text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="font-label-md text-on-surface">{title}</p>
                  <p className="font-body-sm text-on-surface-variant">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-center gap-space-lg border-t border-border-subtle pt-space-lg md:border-t-0 md:border-l md:pl-space-2xl md:pt-0">
          <div>
            <h2 className="font-headline-sm text-on-surface mb-space-2xs">
              Sign in
            </h2>
            <p className="font-body-sm text-on-surface-variant">
              Authenticate securely to continue to your account.
            </p>
          </div>
          <LoginButton />
          <p className="font-body-sm text-on-surface-variant">
            New here?{" "}
            <button
              type="button"
              onClick={() => oidcRegister()}
              className="font-label-md text-primary hover:text-primary-hover underline-offset-2 hover:underline"
            >
              Create an account
            </button>
            <span className="block mt-space-xs">
              Register at our identity provider, then return here to sign in.
            </span>
          </p>
          <Link
            href="/"
            className="font-label-md text-on-surface-variant hover:text-primary"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
