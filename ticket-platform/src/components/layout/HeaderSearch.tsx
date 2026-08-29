"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

interface HeaderSearchProps {
  onSearch?: () => void;
}

export function HeaderSearch({ onSearch }: HeaderSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { t } = useLanguage();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    onSearch?.();
    router.push(q ? `/events?q=${encodeURIComponent(q)}` : "/events");
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          suppressHydrationWarning
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search.placeholder")}
          className="w-full rounded-full border border-gray-200 bg-gray-100 py-2 pl-9 pr-4 text-sm text-gray-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-800"
        />
      </div>
    </form>
  );
}
