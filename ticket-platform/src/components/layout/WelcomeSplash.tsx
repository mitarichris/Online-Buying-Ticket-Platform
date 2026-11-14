"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Check, Ticket } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { locales, type Locale } from "@/i18n/translations";
import { LanguageFlag } from "@/components/layout/LanguageFlag";

type Phase = "welcome" | "language" | "leaving" | "hidden";

export function WelcomeSplash() {
  const { t, locale, setLocale } = useLanguage();
  const [phase, setPhase] = useState<Phase>("welcome");
  const [selected, setSelected] = useState<Locale>(locale);
  const advanceTimer = useRef<number | undefined>(undefined);
  const hideTimer = useRef<number | undefined>(undefined);

  const dismiss = useCallback(() => {
    setPhase((p) => (p === "leaving" || p === "hidden" ? p : "leaving"));
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setPhase("hidden"), 500);
  }, []);

  const showLanguage = useCallback(() => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    setPhase((p) => (p === "welcome" ? "language" : p));
  }, []);

  const confirmLanguage = useCallback(() => {
    setLocale(selected);
    dismiss();
  }, [dismiss, selected, setLocale]);

  useEffect(() => {
    advanceTimer.current = window.setTimeout(() => setPhase("language"), 2500);
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, []);

  useEffect(() => {
    if (phase === "hidden") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [phase]);

  if (phase === "hidden") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0B1F3A] transition-opacity duration-500 ${
        phase === "leaving" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-[#C9A227]/10 blur-3xl" />
      </div>

      {phase === "welcome" ? (
        <div
          onClick={showLanguage}
          className="relative flex cursor-pointer flex-col items-center px-6 text-center"
        >
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
            <div className="h-full w-full origin-left animate-[welcome-progress_2.5s_linear_forwards] rounded-full bg-[#E7C65B]" />
          </div>
        </div>
      ) : (
        <div className="relative w-full max-w-md px-6 text-center">
          <Image
            src="/logo.svg"
            alt="TicketHub"
            width={200}
            height={70}
            className="mx-auto h-12 w-auto sm:h-14"
          />
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {t("welcome.chooseLanguage")}
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm text-slate-300 sm:max-w-sm">
            {t("welcome.chooseLanguageSubtitle")}
          </p>

          <div className="mt-7 grid grid-cols-2 gap-2.5">
            {locales.map((l) => {
              const active = selected === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setSelected(l.code)}
                  aria-pressed={active}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm font-semibold transition ${
                    active
                      ? "border-[#E7C65B] bg-[#E7C65B]/15 text-white"
                      : "border-white/15 bg-white/5 text-slate-200 hover:border-white/30 hover:bg-white/10"
                  }`}
                >
                  <LanguageFlag code={l.code} className="h-6 w-9" />
                  <span className="truncate">{l.native}</span>
                  {active && <Check className="ml-auto h-4 w-4 text-[#E7C65B]" />}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={confirmLanguage}
            className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-[#E7C65B] px-6 py-3 text-sm font-bold text-[#0B1F3A] transition hover:bg-[#f0d675] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E7C65B]"
          >
            {t("welcome.continue")}
          </button>
        </div>
      )}
    </div>
  );
}
