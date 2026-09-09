"use client";

import { useState, useRef, useEffect } from "react";
import { Languages, Check } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { locales } from "@/i18n/translations";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = locales.find((l) => l.code === locale) ?? locales[0];

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Language"
        className="flex items-center gap-1.5 rounded-full border border-white/20 px-2 py-1 text-xs font-medium text-white/80 transition hover:bg-white/10"
      >
        <Languages className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{current.native}</span>
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-lg border border-white/10 bg-[#1a1d24] py-1 shadow-xl">
          {locales.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLocale(l.code);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/10"
            >
              <span>{l.native}</span>
              {l.code === locale && <Check className="h-4 w-4 text-[#D4AF37]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
