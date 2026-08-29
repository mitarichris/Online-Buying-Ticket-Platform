"use client";

import { Search } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

interface EventSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function EventSearch({ value, onChange }: EventSearchProps) {
  const { t } = useLanguage();
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder={t("search.placeholder")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      />
    </div>
  );
}
