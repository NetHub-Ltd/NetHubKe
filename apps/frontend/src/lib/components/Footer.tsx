import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full bg-inverse-surface text-inverse-on-surface pt-space-3xl pb-space-2xl border-t border-slate-800">
      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-2xl pb-space-2xl">
          {/* Brand and Description */}
          <div className="lg:col-span-2 flex flex-col gap-space-md">
            <div className="flex items-center gap-space-xs">
              <img
                alt="NetHub Kenya Logo"
                className="h-7 w-auto object-contain"
                src="/logo.svg"
              />
              <span className="font-headline-md text-headline-md text-surface-canvas font-bold">
                NetHub Kenya
              </span>
              <span className="font-label-sm text-label-sm text-primary-fixed bg-primary/20 px-space-xs py-space-2xs rounded-full uppercase font-bold tracking-wider">
                Enterprise
              </span>
            </div>
            <p className="font-body-md text-body-md text-slate-text-muted max-w-md">
              East Africa&apos;s premier enterprise software and fintech engineering
              authority. We build resilient cloud foundations, high-throughput
              financial rails, and sub-second scale systems powering market leaders
              across the African continent.
            </p>
            <div className="flex flex-col gap-space-xs text-slate-text-muted font-body-sm text-body-sm">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px] text-primary-fixed-dim">
                  location_on
                </span>
                <span>Westlands Nairobi, Kenya</span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px] text-primary-fixed-dim">
                  call
                </span>
                <a
                  className="hover:text-surface-canvas transition-colors"
                  href="tel:+254783202527"
                >
                  +254 783 202 527
                </a>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px] text-primary-fixed-dim">
                  mail
                </span>
                <a
                  className="hover:text-surface-canvas transition-colors"
                  href="mailto:support@nethub.co.ke"
                >
                  support@nethub.co.ke
                </a>
              </div>
            </div>
          </div>

          {/* Corporate Links */}
          <div className="flex flex-col gap-space-md">
            <span className="font-label-md text-label-md text-surface-canvas uppercase font-bold tracking-wider">
              Corporate
            </span>
            <ul className="flex flex-col gap-space-xs font-body-sm text-body-sm text-slate-text-muted">
              <li className="hover:text-surface-canvas transition-colors">
                <Link href="/about">About Us</Link>
              </li>
              <li className="hover:text-surface-canvas transition-colors">
                <Link href="/services">Service Catalog</Link>
              </li>
              <li className="hover:text-surface-canvas transition-colors">
                <Link href="/contact">Project Intake</Link>
              </li>
              <li className="hover:text-surface-canvas transition-colors">
                <Link href="/privacy-policy">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          {/* Specialized Solutions */}
          <div className="flex flex-col gap-space-md">
            <span className="font-label-md text-label-md text-surface-canvas uppercase font-bold tracking-wider">
              Specialized Solutions
            </span>
            <ul className="flex flex-col gap-space-xs font-body-sm text-body-sm text-slate-text-muted">
              <li className="hover:text-surface-canvas transition-colors">
                <Link href="/service/mpesa-integration">
                  M-Pesa Daraja 3.0 API
                </Link>
              </li>
              <li className="hover:text-surface-canvas transition-colors">
                <Link href="/services">Next.js Cloud Systems</Link>
              </li>
              <li className="hover:text-surface-canvas transition-colors">
                <Link href="/services">Technical SEO Audit</Link>
              </li>
              <li className="hover:text-surface-canvas transition-colors">
                <Link href="/services">E-Commerce Middleware</Link>
              </li>
            </ul>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-col gap-space-md">
            <span className="font-label-md text-label-md text-surface-canvas uppercase font-bold tracking-wider">
              Trust Badges
            </span>
            <div className="flex flex-col gap-space-sm">
              <div className="bg-on-surface/40 p-space-sm rounded-lg flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-success-emerald text-[24px]">
                  verified_user
                </span>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-surface-canvas font-bold">
                    PCI-DSS Level 1
                  </span>
                  <span className="font-metric-mono text-metric-mono text-slate-text-muted">
                    Verified Compliance
                  </span>
                </div>
              </div>
              <div className="bg-on-surface/40 p-space-sm rounded-lg flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary-fixed-dim text-[24px]">
                  lock
                </span>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-surface-canvas font-bold">
                    ISO/IEC 27001
                  </span>
                  <span className="font-metric-mono text-metric-mono text-slate-text-muted">
                    Information Security
                  </span>
                </div>
              </div>
              <div className="bg-on-surface/40 p-space-sm rounded-lg flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-tertiary-fixed text-[24px]">
                  bolt
                </span>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-surface-canvas font-bold">
                    Safaricom Daraja 3.0
                  </span>
                  <span className="font-metric-mono text-metric-mono text-slate-text-muted">
                    Certified Partner Node
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright and links */}
        <div className="pt-space-xl border-t border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-space-md text-slate-text-muted font-body-sm text-body-sm">
          <div className="flex items-center gap-space-sm">
            <span>© 2026 NetHub Kenya. All Systems Operational.</span>
          </div>
          <div className="flex items-center gap-space-lg">
            <Link
              className="hover:text-surface-canvas transition-colors"
              href="/privacy-policy"
            >
              Privacy Policy
            </Link>
            <Link
              className="hover:text-surface-canvas transition-colors"
              href="/contact"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
