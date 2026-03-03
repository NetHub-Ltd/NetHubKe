import React from "react";
import Link from "next/link";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold tracking-tighter text-brand-primary"
        >
          NetHub<span className="text-foreground">.co.ke</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 text-sm font-medium opacity-80">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="hover:text-brand-primary transition-colors transition-opacity hover:opacity-100"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-4">
          <button className="bg-brand-primary text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-brand-secondary transition-all shadow-soft active:scale-95">
            Start a Project
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
