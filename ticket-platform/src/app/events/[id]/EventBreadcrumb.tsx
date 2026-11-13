"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

export function EventBreadcrumb({ title }: { title: string }) {
  const { t } = useLanguage();

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
      <Link href="/" className="transition-colors hover:text-slate-900 dark:hover:text-white">
        {t("nav.home")}
      </Link>
      <ChevronRight className="h-3.5 w-3.5" />
      <Link href="/events" className="transition-colors hover:text-slate-900 dark:hover:text-white">
        {t("nav.events")}
      </Link>
      <ChevronRight className="h-3.5 w-3.5" />
      <span className="truncate font-medium text-slate-700 dark:text-slate-200">{title}</span>
    </nav>
  );
}
