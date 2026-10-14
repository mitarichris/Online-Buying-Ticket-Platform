"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CalendarDays, MapPin, Loader2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { EventSuggestion } from "@/types";

interface EventSearchBoxProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onNavigate?: () => void;
  placeholder?: string;
  inputClassName?: string;
  autoFocus?: boolean;
}

export function EventSearchBox({
  value,
  onChange,
  onSubmit,
  onNavigate,
  placeholder,
  inputClassName,
  autoFocus,
}: EventSearchBoxProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);

  const [internalQuery, setInternalQuery] = useState("");
  const query = value !== undefined ? value : internalQuery;

  const [suggestions, setSuggestions] = useState<EventSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  function updateQuery(next: string) {
    if (value !== undefined) {
      onChange?.(next);
    } else {
      setInternalQuery(next);
    }
  }

  useEffect(() => {
    const trimmed = query.trim();
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      if (!open || trimmed.length < 1) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `/api/events/suggestions?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("failed");
        const data: EventSuggestion[] = await res.json();
        setSuggestions(data);
        setActiveIndex(-1);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function goToEvent(id: string) {
    setOpen(false);
    onNavigate?.();
    router.push(`/events/${id}`);
  }

  function submitSearch() {
    const trimmed = query.trim();
    setOpen(false);
    onNavigate?.();
    if (onSubmit) {
      onSubmit(trimmed);
    } else {
      router.push(trimmed ? `/events?q=${encodeURIComponent(trimmed)}` : "/events");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && activeIndex >= 0 && suggestions[activeIndex]) {
        goToEvent(suggestions[activeIndex].id);
      } else {
        submitSearch();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const trimmed = query.trim();
  const showDropdown = open && trimmed.length > 0;
  const showViewAll = !loading && suggestions.length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitSearch();
        }}
        role="search"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            suppressHydrationWarning
            type="text"
            value={query}
            autoFocus={autoFocus}
            onChange={(e) => {
              updateQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder ?? t("search.placeholder")}
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls="event-search-suggestions"
            aria-autocomplete="list"
            className={
              inputClassName ??
              "w-full rounded-full border border-gray-200 bg-gray-100 py-2 pl-9 pr-4 text-sm text-gray-900 transition focus:border-[#D4AF37] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-800"
            }
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
          )}
        </div>
      </form>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
          {suggestions.length === 0 && !loading ? (
            <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              {t("search.noResults")}
            </p>
          ) : (
            <ul id="event-search-suggestions" role="listbox">
              {suggestions.map((suggestion, index) => (
                <li key={suggestion.id} role="option" aria-selected={index === activeIndex}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => goToEvent(suggestion.id)}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left transition ${
                      index === activeIndex
                        ? "bg-gray-100 dark:bg-gray-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/60"
                    }`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                      {suggestion.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={suggestion.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <CalendarDays className="h-4 w-4 text-gray-400" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-gray-900 dark:text-white">
                        {suggestion.title}
                      </span>
                      <span className="mt-0.5 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="truncate">{suggestion.category}</span>
                        {suggestion.city && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="h-3 w-3" />
                            {suggestion.city}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {showViewAll && (
            <button
              type="button"
              onClick={submitSearch}
              className="w-full border-t border-gray-100 px-3 py-2 text-left text-sm font-medium text-[#B8942E] transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/60"
            >
              {t("search.viewAll", { query: trimmed })}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
