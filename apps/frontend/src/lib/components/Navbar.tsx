"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/service/mpesa-integration") {
      return (
        pathname === "/service/mpesa-integration" ||
        pathname.startsWith("/services/mpesa") ||
        pathname.includes("mpesa")
      );
    }
    if (href === "/services") {
      return (
        pathname === "/services" ||
        (pathname.startsWith("/services") && !pathname.includes("mpesa"))
      );
    }
    return pathname === href;
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface-canvas/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(15,23,42,0.04)] border-b border-border-subtle/50">
      <div className="h-16 max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop flex items-center justify-between gap-space-md">
        {/* Brand Logo and Telemetry */}
        <div className="flex items-center gap-space-md shrink-0">
          <Link className="flex items-center gap-space-xs" href="/">
            <img
              alt="NetHub Kenya Logo"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1UHsikKjlAvspjnMYt3JWRomKLvAQ2d00ACECPeufCebeg2m62KM0rvqPGVSDX46l9pKnEiNLEnvBN5yM_gUERaccczyLAj0DjvPP2kDPhbbOy2I4xd_Ry-7XxF8JbXWZ2FwutiiE6AQJHB7qSw4s8QjAMEOTvmdv63_6fAM63xCq3hnZIPjdoEgl2zidklATqEGecCbMkwqDSjoUgW70DkzMSRtvpaUFrEJF2VkbDy6XauyEmYEAu933s"
            />
            <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">
              NetHub
            </span>
            <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
              KE
            </span>
          </Link>
          <div className="hidden xl:flex items-center gap-space-xs bg-success-emerald-bg px-space-sm py-space-2xs rounded-full shadow-[0_1px_3px_0_rgba(15,23,42,0.04)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-emerald opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success-emerald"></span>
            </span>
            <span className="font-metric-mono text-metric-mono text-tertiary font-bold">
              All Systems Nominal
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-space-lg">
          <Link
            className={`font-label-md text-label-md transition-colors ${
              isActive("/services")
                ? "text-primary font-bold"
                : "text-on-surface-variant hover:text-primary"
            }`}
            href="/services"
          >
            Services
          </Link>
          <Link
            className={`font-label-md text-label-md transition-colors ${
              isActive("/service/mpesa-integration")
                ? "text-primary font-bold"
                : "text-on-surface-variant hover:text-primary"
            }`}
            href="/service/mpesa-integration"
          >
            Daraja 3.0 M-Pesa
          </Link>
          <Link
            className={`font-label-md text-label-md transition-colors ${
              isActive("/about")
                ? "text-primary font-bold"
                : "text-on-surface-variant hover:text-primary"
            }`}
            href="/about"
          >
            About
          </Link>
          <Link
            className={`font-label-md text-label-md transition-colors ${
              isActive("/contact")
                ? "text-primary font-bold"
                : "text-on-surface-variant hover:text-primary"
            }`}
            href="/contact"
          >
            Contact
          </Link>
        </nav>

        {/* Action CTAs & Mobile Menu Button */}
        <div className="flex items-center gap-space-sm shrink-0">
          <Link
            className="hidden sm:inline-flex items-center font-label-md text-label-md text-on-surface px-space-md py-space-xs rounded-lg hover:bg-surface-subtle hover:text-primary transition-all"
            href="/schedule"
          >
            Book Architecture Review
          </Link>
          <Link
            className="inline-flex items-center font-label-md text-label-md text-on-primary bg-primary-container hover:bg-brand-cobalt-hover hover:text-on-primary px-space-lg py-space-xs rounded-lg shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] transition-all font-semibold"
            href="/contact"
          >
            Start Project
          </Link>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-on-surface hover:text-primary transition-colors focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-surface-canvas border-b border-border-subtle shadow-lg px-gutter-mobile py-space-md flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-xs bg-success-emerald-bg px-space-sm py-space-2xs rounded-full w-fit mb-space-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-emerald opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success-emerald"></span>
            </span>
            <span className="font-metric-mono text-metric-mono text-tertiary font-bold">
              All Systems Nominal
            </span>
          </div>
          <Link
            href="/services"
            className={`font-label-md text-label-md py-2 px-3 rounded-lg ${
              isActive("/services")
                ? "bg-brand-cobalt-light text-primary font-bold"
                : "text-on-surface-variant hover:bg-surface-subtle"
            }`}
          >
            Services
          </Link>
          <Link
            href="/service/mpesa-integration"
            className={`font-label-md text-label-md py-2 px-3 rounded-lg ${
              isActive("/service/mpesa-integration")
                ? "bg-brand-cobalt-light text-primary font-bold"
                : "text-on-surface-variant hover:bg-surface-subtle"
            }`}
          >
            Daraja 3.0 M-Pesa
          </Link>
          <Link
            href="/about"
            className={`font-label-md text-label-md py-2 px-3 rounded-lg ${
              isActive("/about")
                ? "bg-brand-cobalt-light text-primary font-bold"
                : "text-on-surface-variant hover:bg-surface-subtle"
            }`}
          >
            About
          </Link>
          <Link
            href="/contact"
            className={`font-label-md text-label-md py-2 px-3 rounded-lg ${
              isActive("/contact")
                ? "bg-brand-cobalt-light text-primary font-bold"
                : "text-on-surface-variant hover:bg-surface-subtle"
            }`}
          >
            Contact
          </Link>
          <div className="pt-space-xs border-t border-border-subtle flex flex-col gap-space-xs">
            <Link
              href="/schedule"
              className="font-label-md text-label-md text-on-surface py-2 px-3 rounded-lg hover:bg-surface-subtle text-center"
            >
              Book Architecture Review
            </Link>
            <Link
              href="/contact"
              className="font-label-md text-label-md text-on-primary bg-primary-container hover:bg-brand-cobalt-hover py-2.5 px-4 rounded-lg text-center font-bold"
            >
              Start Project
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
