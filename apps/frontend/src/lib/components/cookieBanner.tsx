"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("nethub_cookie_consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("nethub_cookie_consent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[100] md:left-auto md:max-w-sm">
      <div className="bg-card border border-border p-6 rounded-2xl shadow-2xl backdrop-blur-lg">
        <div className="flex justify-between items-start mb-4">
          <h4 className="font-bold text-brand-primary">Cookie Policy</h4>
          <button
            onClick={() => setIsVisible(false)}
            className="opacity-50 hover:opacity-100"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-foreground/70 leading-relaxed mb-6">
          We use cookies to improve your experience and analyze our traffic. By
          clicking "Accept", you agree to our
          <Link href="/privacy" className="text-brand-primary underline ml-1">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex gap-3">
          <button
            onClick={acceptCookies}
            className="flex-1 bg-brand-primary text-white py-2 rounded-xl text-sm font-bold hover:bg-brand-secondary transition-all"
          >
            Accept
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="flex-1 border border-border py-2 rounded-xl text-sm font-bold hover:bg-background transition-all"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
