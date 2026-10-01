"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (!localStorage.getItem("nethub_cookie_consent")) {
        setIsVisible(true);
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("nethub_cookie_consent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-100 md:left-auto md:max-w-sm">
      <div className="card-surface border border-border-subtle shadow-lg backdrop-blur-sm">
        <div className="mb-space-md flex items-start justify-between gap-space-sm">
          <h4 className="font-label-md text-primary">Cookie Policy</h4>
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="btn-ghost p-space-2xs text-on-surface-variant"
            aria-label="Dismiss cookie notice"
          >
            <X size={18} />
          </button>
        </div>
        <p className="font-body-sm text-on-surface-variant mb-space-lg">
          We use cookies to improve your experience and analyze traffic. By
          choosing Accept, you agree to our{" "}
          <Link
            href="/privacy-policy"
            className="text-primary font-label-md underline-offset-2 hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex gap-space-sm">
          <button type="button" onClick={acceptCookies} className="btn-primary flex-1">
            Accept
          </button>
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="btn-secondary flex-1"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
