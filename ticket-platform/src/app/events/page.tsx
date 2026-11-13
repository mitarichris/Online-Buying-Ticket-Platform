"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowUpDown, CalendarDays, ChevronRight, SearchX } from "lucide-react";
import { EventCard } from "@/components/events/EventCard";
import { EventSearch } from "@/components/events/EventSearch";
import { useLanguage } from "@/i18n/LanguageProvider";
import { categories } from "@/lib/categories";
import { getMinPrice } from "@/lib/utils";
import type { Event } from "@/types";

type SortKey = "date" | "price";

function EventsList() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const urlQuery = searchParams.get("q") ?? "";
  const { t } = useLanguage();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(urlQuery);
  const [prevQuery, setPrevQuery] = useState(urlQuery);
  const [sort, setSort] = useState<SortKey>("date");

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

  const activeCategory = categories.find(
    (item) => item.slug.toLowerCase() === (category ?? "").toLowerCase()
  );

  const heading = activeCategory
    ? t(activeCategory.labelKey)
    : t("events.discover");

  const sortedEvents = useMemo(() => {
    const list = [...events];
    list.sort((a, b) => {
      if (sort === "price") {
        return (
          (getMinPrice(a.ticketTypes) ?? Number.MAX_SAFE_INTEGER) -
          (getMinPrice(b.ticketTypes) ?? Number.MAX_SAFE_INTEGER)
        );
      }
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    return list;
  }, [events, sort]);

  const chipBase =
    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors";
  const chipActive = "border-blue-600 bg-blue-600 text-white";
  const chipIdle =
    "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0d12]">
      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Link href="/" className="transition-colors hover:text-slate-900 dark:hover:text-white">
              {t("nav.home")}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {t("nav.events")}
            </span>
          </nav>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            {heading}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            {t("events.find")}
          </p>

          <div className="mt-6 max-w-2xl">
            <EventSearch value={search} onChange={setSearch} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <Link href="/events" className={`${chipBase} ${!category ? chipActive : chipIdle}`}>
            {t("events.all")}
          </Link>
          {categories.map((item) => {
            const Icon = item.icon;
            const active = category?.toLowerCase() === item.slug.toLowerCase();
            return (
              <Link
                key={item.slug}
                href={`/events?category=${encodeURIComponent(item.slug)}`}
                className={`${chipBase} ${active ? chipActive : chipIdle}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {loading ? t("events.loading") : t("events.results", { count: events.length })}
          </p>

          <label className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <span>{t("events.sort")}</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="cursor-pointer rounded-md border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-900 outline-none transition-colors hover:border-slate-300 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="date" className="bg-white font-semibold text-slate-900 dark:bg-slate-800 dark:text-white">
                {t("events.sort.date")}
              </option>
              <option value="price" className="bg-white font-semibold text-slate-900 dark:bg-slate-800 dark:text-white">
                {t("events.sort.price")}
              </option>
            </select>
          </label>
        </div>

        {loading ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="aspect-[16/9] bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-3 p-4">
                  <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-8 w-full rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
            <SearchX className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
              {t("events.empty")}
            </p>
            {(category || search) && (
              <Link
                href="/events"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <CalendarDays className="h-4 w-4" />
                {t("events.clear")}
              </Link>
            )}
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
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
