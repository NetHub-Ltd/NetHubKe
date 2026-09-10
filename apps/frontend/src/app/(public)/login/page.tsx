"use client";

import React from "react";
import { LoginButton } from "@/lib/components/loginButton";
import { ShieldCheck, Cpu, Zap } from "lucide-react";
import { keycloakRegister } from "@/lib/utils/authClient";
import Link from "next/link";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-2">
      <div className="w-full card-layered max-w-5xl rounded-none md:rounded-3xl overflow-hidden flex flex-col md:flex-row">
        <div className="relative md:w-2/3 p-8 md:p-12 flex flex-col justify-center">
          <div className="relative z-10 max-w-md">
            <h1 className="text-h3 text-gradient leading-tight mb-4">
              <span>NetHub Kenya</span>
            </h1>

            <div className="hidden md:block">
              <p className="mb-8">
                Secure, reliable access to your infrastructure and services —
                built with performance and trust at its core.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-brand-primary" />
                  <span className="text-sm">Enterprise-grade security</span>
                </div>
                <div className="flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-brand-primary" />
                  <span className="text-sm">Optimized system performance</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-brand-primary" />
                  <span className="text-sm">Fast, reliable access</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:w-1/3 bg-card p-8 md:p-10 flex flex-col justify-center">
          <h2 className="text-lg font-semibold text-center mb-2">Sign in</h2>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Authenticate securely to continue to your account
          </p>

          <LoginButton />

          <p className="text-sm text-center mt-6 text-muted-foreground">
            New here?{" "}
            <button
              type="button"
              onClick={() => keycloakRegister()}
              className="text-brand-primary font-semibold hover:underline"
            >
              Create an account
            </button>
          </p>

          <p className="text-xs text-muted-foreground text-center mt-4">
            <Link href="/" className="hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
