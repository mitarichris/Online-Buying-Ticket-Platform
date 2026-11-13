"use client";

import { Building2, Calendar, Clock, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Event } from "@/types";

export function EventDetailInfo({ event }: { event: Event }) {
  const { t, locale } = useLanguage();

  const details = [
    {
      icon: Calendar,
      label: t("event.date"),
      value: formatDate(event.date, locale),
    },
    {
      icon: Clock,
      label: t("event.time"),
      value: event.time,
    },
    {
      icon: MapPin,
      label: t("event.venue"),
      value: `${event.venue}, ${event.city}`,
    },
  ];

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        {details.map((detail) => {
          const Icon = detail.icon;
          return (
            <div
              key={detail.label}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {detail.label}
                </p>
                <p className="mt-0.5 break-words text-sm font-semibold leading-snug text-slate-900 dark:text-white">
                  {detail.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {t("event.about")}
        </h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {event.description}
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
          <Building2 className="h-4 w-4 shrink-0" />
          <span>
            {event.address}, {event.city}
          </span>
        </div>
      </div>
    </>
  );
}
