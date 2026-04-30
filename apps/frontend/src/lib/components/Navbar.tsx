"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, Zap } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
// import { LoginButton } from "./loginButton";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll state for glassmorphism toggle
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setIsOpen(false), [pathname]);

  return (
    <nav
      className={`sticky top-0 z-100 transition-all duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl py-3 border-b border-border shadow-lg"
          : "bg-background shadow-sm py-5 border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo with Hover Animation */}
        <Link href="/" className="group flex gap-2 items-center">
          <motion.div
            whileHover={{ rotate: 12 }}
            className="relative w-10 h-10 flex items-center justify-center bg-brand-primary/10 rounded-xl border border-brand-primary/20"
          >
            <Image
              src="/logo.svg"
              alt="NetHub Logo"
              width={40}
              height={40}
              priority // Tells Next.js to load this immediately without waiting for other assets
              className="shrink-0 text-gradient"
            />
          </motion.div>
          <span className="text-2xl text-gradient font-bold tracking-tighter">
            NetHub
            <span className="text-brand-primary group-hover:text-brand-secondary transition-colors">
              {" "}
              Kenya
            </span>
          </span>
        </Link>

        {/* Desktop Links with Active Indicator */}
        <div className="hidden md:flex gap-10 items-center">
          <div className="flex gap-8 items-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative font-bold  tracking-widest transition-all hover:text-brand-primary ${
                    isActive ? "text-brand-primary" : "text-foreground"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 w-full h-0.5 bg-brand-primary rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* <LoginButton /> */}

          {/* Premium CTA */}
          <Link
            href="/services"
            className="relative overflow-hidden bg-brand-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 group shadow-glow hover:shadow-brand-primary/40 transition-all active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Project
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </span>
            <motion.div
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent z-0"
            />
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-foreground focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={30} /> : <Menu size={30} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 top-19 bg-background z-90 md:hidden border-t border-border"
          >
            <div className="flex flex-col p-8 gap-6 h-full justify-between pb-24">
              <div className="flex flex-col gap-6">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className={`text-4xl font-black tracking-tighter flex items-center justify-between group ${
                        pathname === link.href
                          ? "text-brand-primary"
                          : "text-foreground"
                      }`}
                    >
                      {link.name}
                      <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-6">
                <p className="text-muted text-sm font-medium flex items-center gap-2 italic">
                  <Zap
                    size={16}
                    className="text-brand-primary fill-brand-primary"
                  />
                  Nairobi&apos;s Fintech Engineering Partner
                </p>
                <Link
                  href="/contact"
                  className="w-full bg-foreground text-background py-6 rounded-3xl font-black text-xl text-center flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
                >
                  Get a Free Quote <ArrowRight />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
