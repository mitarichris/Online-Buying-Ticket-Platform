"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Ticket } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

export function WelcomeSplash() {
  const { t } = useLanguage();
  const [leaving, setLeaving] = useState(false);
  const [hidden, setHidden] = useState(false);
  const leaveTimer = useRef<number | undefined>(undefined);
  const hideTimer = useRef<number | undefined>(undefined);

  const dismiss = useCallback(() => {
    setLeaving(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setHidden(true), 500);
  }, []);

  useEffect(() => {
    leaveTimer.current = window.setTimeout(() => setLeaving(true), 2500);
    hideTimer.current = window.setTimeout(() => setHidden(true), 3000);
    return () => {
      if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, []);

  useEffect(() => {
    if (hidden) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [hidden]);

  if (hidden) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={dismiss}
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0B1F3A] transition-opacity duration-500 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-[#C9A227]/10 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center px-6 text-center">
        <Image
          src="/logo.svg"
          alt="TicketHub"
          width={240}
          height={84}
          priority
          className="h-16 w-auto sm:h-20"
        />
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {t("welcome.title")}
        </h1>
        <p className="mt-2 max-w-xs text-sm text-slate-300 sm:max-w-sm">
          {t("welcome.subtitle")}
        </p>

        <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
          <Ticket className="h-3.5 w-3.5 text-[#E7C65B]" />
          TicketHub
        </span>

        <div className="mt-6 h-1 w-40 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-full origin-left animate-[welcome-progress_3s_linear_forwards] rounded-full bg-[#E7C65B]" />
        </div>
      </div>
    </div>
  );
}
