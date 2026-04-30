"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ChevronLeft, Terminal, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        {/* Visual Error Code */}
        <div className="relative mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[12rem] md:text-[18rem] font-black leading-none tracking-tighter text-brand-primary/10 select-none"
          >
            404
          </motion.h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-background border border-border p-4 rounded-2xl shadow-2xl flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                <AlertTriangle size={24} />
              </div>
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Status Error
                </p>
                <p className="font-bold text-foreground">
                  Endpoint Not Resolved
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Messaging */}
        <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight">
          Lost in the <span className="text-brand-primary">Source Code?</span>
        </h2>
        <p className="text-lg text-muted-foreground mb-12 max-w-md mx-auto leading-relaxed">
          The architectural path you’re looking for doesn’t exist or has been
          refactored to a new location. Let’s get you back to the main branch.
        </p>

        {/* Action Grid */}
        <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-foreground text-background px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all group"
          >
            <Home size={18} />
            Go Home
          </Link>

          <Link
            href="/services"
            className="flex items-center justify-center gap-2 bg-card border border-border px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:border-brand-primary hover:text-brand-primary transition-all"
          >
            <Terminal size={18} />
            Our Solutions
          </Link>
        </div>

        {/* Technical Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.5 }}
          className="mt-16 flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground"
        >
          <span>Error_Code: NULL_POINTER</span>
          <span className="w-1 h-1 bg-muted-foreground rounded-full" />
          <span>Loc: Nairobi_Edge_Server</span>
        </motion.div>
      </div>
    </div>
  );
}
