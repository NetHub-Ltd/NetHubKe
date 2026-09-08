"use client";

import React from "react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 font-sans p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md border border-slate-200 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            An unexpected error occurred. Our engineering team has been notified.
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center bg-[#0052cc] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#003da1] transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
