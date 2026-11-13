"use client";

import { ShieldCheck, Ticket, Zap } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

export function EventTrustHints() {
  const { t } = useLanguage();

  const hints = [
    {
      icon: ShieldCheck,
      tint: "text-emerald-500",
      title: t("event.secureCheckout"),
      description: t("event.secureCheckoutHint"),
    },
    {
      icon: Zap,
      tint: "text-amber-500",
      title: t("event.instantDelivery"),
      description: t("event.instantDeliveryHint"),
    },
    {
      icon: Ticket,
      tint: "text-blue-500",
      title: t("event.supportTitle"),
      description: t("event.supportHint"),
    },
  ];

  return (
    <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      {hints.map((hint) => {
        const Icon = hint.icon;
        return (
          <div key={hint.title} className="flex items-start gap-3">
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${hint.tint}`} />
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                {hint.title}
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                {hint.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
