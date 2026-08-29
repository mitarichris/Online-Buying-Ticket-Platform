"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { EventCard } from "@/components/events/EventCard";
import { EventSearch } from "@/components/events/EventSearch";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Event } from "@/types";

function EventsList() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const urlQuery = searchParams.get("q") ?? "";
  const { t } = useLanguage();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(urlQuery);
  const [prevQuery, setPrevQuery] = useState(urlQuery);

  if (urlQuery !== prevQuery) {
    setPrevQuery(urlQuery);
    setSearch(urlQuery);
  }

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("q", search);
        if (category) params.set("category", category);
        const qs = params.toString();
        const res = await fetch(`/api/events${qs ? `?${qs}` : ""}`);
        if (!res.ok) throw new Error(`Failed to fetch events (${res.status})`);
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error(err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchEvents, 300);
    return () => clearTimeout(timer);
  }, [search, category]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {category ? t("events.categoryTitle", { category: category.charAt(0).toUpperCase() + category.slice(1) }) : t("events.discover")}
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{t("events.find")}</p>
      </div>

      <div className="mb-8">
        <EventSearch value={search} onChange={setSearch} />
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <div className="aspect-[16/9] rounded-t-xl bg-gray-200 dark:bg-gray-800" />
              <div className="space-y-3 p-4">
                <div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-gray-500 dark:text-gray-400">{t("events.empty")}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={null}>
      <EventsList />
    </Suspense>
  );
}
