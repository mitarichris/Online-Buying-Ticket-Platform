"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Headphones,
  MapPin,
  ShieldCheck,
  Sparkles,
  Ticket,
  Zap,
} from "lucide-react";
import { EventCard, type EventCardEvent } from "@/components/events/EventCard";
import { EventSearchBox } from "@/components/events/EventSearchBox";
import { useLanguage } from "@/i18n/LanguageProvider";
import { categories, matchesCategory } from "@/lib/categories";
import { isPastEvent } from "@/lib/event-date";
import { formatCurrency, getDateParts, getMinPrice, getShortDate } from "@/lib/utils";

type HomeEvent = EventCardEvent;

const popularEvents: HomeEvent[] = [
  {
    id: "evt_8",
    title: "NBA All-Star Game",
    image: "/images/nba-allstar.jpeg",
    date: "Feb 15, 2026",
    genre: "Sports",
    category: "Sports",
    venue: "Madison Square Garden",
    city: "New York",
    time: "7:00 PM",
    price: 45000,
  },
  {
    id: "evt_7",
    title: "Champions League Finals",
    image: "/images/champions-league.png",
    date: "Aug 28, 2026",
    genre: "Sports",
    category: "Sports",
    venue: "Wembley Stadium",
    city: "London",
    time: "8:00 PM",
    price: 120000,
  },
  {
    id: "evt_1",
    title: "Rock Night 2026",
    image: "/images/rock-night-2026.jpg",
    date: "Sep 5, 2026",
    genre: "Music Festival",
    category: "Festivals",
    venue: "Kigali Arena",
    city: "Kigali",
    time: "7:00 PM",
    price: 65000,
  },
  {
    id: "evt_2",
    title: "The Phantom of the Opera",
    image: "/images/broadway-the-phantom.jpg",
    date: "Sep 12, 2026",
    genre: "Theater",
    category: "Theater",
    venue: "Majestic Theatre",
    city: "New York",
    time: "8:00 PM",
    price: 130000,
  },
  {
    id: "evt_3",
    title: "Tech Summit 2026",
    image: "/images/tech-summit-2026.jpg",
    date: "Oct 1, 2026",
    genre: "Conference",
    category: "Conference",
    venue: "Kigali Convention Centre",
    city: "Kigali",
    time: "9:00 AM",
    price: 100000,
  },
  {
    id: "evt_4",
    title: "Jazz & Blues Festival",
    image: "/images/jazz-blues-festival.jpg",
    date: "Oct 15, 2026",
    genre: "Music Festival",
    category: "Festivals",
    venue: "Grant Park",
    city: "Chicago",
    time: "2:00 PM",
    price: 52000,
  },
  {
    id: "evt_9",
    title: "Modern Art Expo",
    image: "/images/modern-art-expo.jpg",
    date: "Nov 10, 2026",
    genre: "Expo",
    category: "Exhibitions",
    venue: "Kigali Art Gallery",
    city: "Kigali",
    time: "10:00 AM",
    price: 15000,
  },
  {
    id: "evt_5",
    title: "Comedy Night Special",
    image: "/images/comedy-night-special.jpg",
    date: "Aug 30, 2026",
    genre: "Comedy Show",
    category: "Comedy",
    venue: "The Comedy Store",
    city: "Los Angeles",
    time: "8:30 PM",
    price: 45500,
  },
  {
    id: "evt_6",
    title: "Electronic Music Festival",
    image: "/images/electronic-music-festival.jpg",
    date: "Dec 1, 2026",
    genre: "Music Festival",
    category: "Festivals",
    venue: "Kigali Arena",
    city: "Kigali",
    time: "12:00 PM",
    price: 260000,
  },
  {
    id: "evt_10",
    title: "Auto Show 2026",
    image: "/images/auto-show.jpg",
    date: "Dec 5, 2026",
    genre: "Expo",
    category: "Exhibitions",
    venue: "Kigali Convention Centre",
    city: "Kigali",
    time: "10:00 AM",
    price: 20000,
  },
  {
    id: "evt_11",
    title: "Avengers: Doomsday",
    image: "/images/avengers-doomsday.jpg",
    date: "Dec 18, 2026",
    genre: "Superhero",
    category: "Movies",
    venue: "Canal Olympia",
    city: "Kigali",
    time: "6:30 PM",
    price: 12000,
  },
  {
    id: "evt_14",
    title: "Moana",
    image: "/images/moana.jpg",
    date: "Dec 4, 2026",
    genre: "Adventure",
    category: "Movies",
    venue: "Canal Olympia",
    city: "Kigali",
    time: "4:00 PM",
    price: 10000,
  },
];

interface ApiEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  genre?: string | null;
  image?: string | null;
  time?: string;
  venue?: string;
  city?: string;
  ticketTypes?: { price: number }[];
}

function toCardItem(event: ApiEvent): HomeEvent {
  return {
    id: event.id,
    title: event.title,
    image: event.image || "/images/hero-bg.png",
    date: event.date,
    genre: event.genre || event.category || "",
    category: event.category,
    time: event.time,
    venue: event.venue,
    city: event.city,
    ticketTypes: event.ticketTypes,
  };
}

const fallbackEvents = popularEvents.filter((event) => !isPastEvent(event.date));

export default function HomePage() {
  const [dbEvents, setDbEvents] = useState<HomeEvent[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const { t } = useLanguage();

  useEffect(() => {
    let active = true;
    fetch("/api/events")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ApiEvent[]) => {
        if (active && Array.isArray(data)) {
          setDbEvents(data.map(toCardItem));
        }
      })
      .catch(() => {
        // Fall back to the static catalogue if the API is unavailable.
      });
    return () => {
      active = false;
    };
  }, []);

  const allEvents = useMemo(
    () => (dbEvents.length > 0 ? dbEvents : fallbackEvents),
    [dbEvents]
  );

  const categoryCounts = useMemo(() => {
    return categories.reduce<Record<string, number>>((counts, category) => {
      counts[category.slug] = allEvents.filter((event) =>
        matchesCategory(event.category, event.genre, category.slug)
      ).length;
      return counts;
    }, {});
  }, [allEvents]);

  const upcoming = useMemo(() => {
    if (activeCategory === "all") return allEvents;
    return allEvents.filter((event) =>
      matchesCategory(event.category, event.genre, activeCategory)
    );
  }, [allEvents, activeCategory]);

  const featuredEvents = useMemo(() => allEvents.slice(0, 5), [allEvents]);
  const featuredCount = featuredEvents.length;
  const [slide, setSlide] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);

  useEffect(() => {
    if (featuredCount <= 1 || carouselPaused) return;
    const timer = setInterval(() => {
      setSlide((current) => (current + 1) % featuredCount);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredCount, carouselPaused, slide]);

  const safeSlide = featuredCount > 0 ? slide % featuredCount : 0;

  function goToSlide(index: number) {
    if (featuredCount === 0) return;
    setSlide(((index % featuredCount) + featuredCount) % featuredCount);
  }

  const benefits = [
    {
      icon: ShieldCheck,
      title: t("home.why.secure.title"),
      description: t("home.why.secure.desc"),
      tint: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    },
    {
      icon: Zap,
      title: t("home.why.instant.title"),
      description: t("home.why.instant.desc"),
      tint: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    },
    {
      icon: BadgeCheck,
      title: t("home.why.verified.title"),
      description: t("home.why.verified.desc"),
      tint: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    },
    {
      icon: Headphones,
      title: t("home.why.support.title"),
      description: t("home.why.support.desc"),
      tint: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
    },
  ];

  const steps = [
    { title: t("home.how.s1.title"), description: t("home.how.s1.desc") },
    { title: t("home.how.s2.title"), description: t("home.how.s2.desc") },
    { title: t("home.how.s3.title"), description: t("home.how.s3.desc") },
  ];

  return (
    <div className="bg-slate-50 dark:bg-[#0b0d12]">
      <section className="relative overflow-hidden bg-[#0B1F3A]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-[#C9A227]/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:pb-24 lg:pt-20">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-[#E7C65B]" />
                {t("home.hero.badge")}
              </span>

              <h1 className="mt-5 max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                {t("home.hero.title")}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                {t("home.hero.subtitle")}
              </p>

              <div className="mt-7 max-w-xl">
                <EventSearchBox
                  placeholder={t("home.searchHint")}
                  showSubmitButton
                  submitLabel={t("home.search")}
                  inputClassName="w-full rounded-xl border border-transparent bg-white py-3.5 pl-10 pr-14 text-sm text-slate-900 shadow-lg placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 sm:pr-32"
                />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  {t("home.why.secure.title")}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-300" />
                  {t("home.why.instant.title")}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Ticket className="h-4 w-4 text-sky-300" />
                  {t("home.trust.mobile")}
                </span>
              </div>
            </div>

            {featuredCount > 0 && (
              <div
                className="relative mx-auto w-full min-w-0 max-w-md lg:mx-0 lg:ml-auto"
                onMouseEnter={() => setCarouselPaused(true)}
                onMouseLeave={() => setCarouselPaused(false)}
                onFocus={() => setCarouselPaused(true)}
                onBlur={() => setCarouselPaused(false)}
              >
                <div className="absolute -inset-3 rounded-[2rem] bg-white/5" />
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl dark:bg-slate-900">
                  <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${safeSlide * 100}%)` }}
                  >
                    {featuredEvents.map((event, index) => {
                      const eventDate = getDateParts(event.date);
                      const eventPrice = getMinPrice(event.ticketTypes, event.price);
                      return (
                        <div key={event.id} className="w-full shrink-0">
                          <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                            <Image
                              src={event.image || "/images/hero-bg.png"}
                              alt={event.title}
                              fill
                              priority={index === 0}
                              unoptimized
                              sizes="(max-width: 1024px) 100vw, 420px"
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
                            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-slate-800 backdrop-blur">
                              {t("home.featured")}
                            </span>
                            {eventDate && (
                              <div className="absolute bottom-3 left-3 flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-white text-center shadow-lg">
                                <span className="text-[10px] font-bold uppercase tracking-wide text-rose-600">
                                  {eventDate.month}
                                </span>
                                <span className="text-xl font-extrabold leading-none text-slate-900">
                                  {eventDate.day}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="p-4 sm:p-5">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                              {event.genre || event.category}
                            </p>
                            <h2 className="mt-1 line-clamp-1 text-xl font-bold text-slate-900 dark:text-white">
                              {event.title}
                            </h2>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays className="h-4 w-4" />
                                {getShortDate(event.date)}
                              </span>
                              {event.venue && (
                                <span className="inline-flex items-center gap-1.5">
                                  <MapPin className="h-4 w-4" />
                                  {event.venue}
                                  {event.city ? `, ${event.city}` : ""}
                                </span>
                              )}
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                              <div>
                                {eventPrice !== undefined ? (
                                  <>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                      {t("event.fromLabel")}
                                    </p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                                      {formatCurrency(eventPrice)}
                                    </p>
                                  </>
                                ) : (
                                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    {t("home.currencyNote")}
                                  </p>
                                )}
                              </div>
                              <Link
                                href={`/events/${event.id}`}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                              >
                                {t("home.getTickets")}
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {featuredCount > 1 && (
                  <div className="mt-3 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => goToSlide(safeSlide - 1)}
                      aria-label="Previous featured event"
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-1.5">
                      {featuredEvents.map((event, index) => (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => goToSlide(index)}
                          aria-label={`Go to featured event ${index + 1}`}
                          aria-current={index === safeSlide}
                          className={`h-2 rounded-full transition-all ${
                            index === safeSlide
                              ? "w-6 bg-white"
                              : "w-2 bg-white/40 hover:bg-white/70"
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => goToSlide(safeSlide + 1)}
                      aria-label="Next featured event"
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl sm:grid-cols-4 sm:gap-3 lg:grid-cols-8 dark:border-slate-800 dark:bg-slate-900">
          {categories.map((category) => {
            const Icon = category.icon;
            const count = categoryCounts[category.slug] ?? 0;
            return (
              <Link
                key={category.slug}
                href={`/events?category=${encodeURIComponent(category.slug)}`}
                className="group flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-center transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${category.tint}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {t(category.labelKey)}
                </span>
                {count > 0 && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {t("home.eventCount", { count })}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              {t("home.upcoming.title")}
            </h2>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              {t("home.upcoming.subtitle")}
            </p>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400"
          >
            {t("home.viewAll")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeCategory === "all"
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            {t("home.allCategories")}
          </button>
          {categories.map((category) => {
            const active = activeCategory === category.slug;
            return (
              <button
                key={category.slug}
                type="button"
                onClick={() => setActiveCategory(category.slug)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                {t(category.labelKey)}
              </button>
            );
          })}
        </div>

        {upcoming.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {upcoming.slice(0, 9).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
            <CalendarDays className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
              {t("home.empty")}
            </p>
            <Link
              href="/events"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {t("home.viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>

      <section className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              {t("home.why.title")}
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {t("home.why.subtitle")}
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${benefit.tint}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
                    {benefit.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            {t("home.how.title")}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t("home.how.subtitle")}
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B1F3A] text-sm font-bold text-white dark:bg-[#C9A227] dark:text-slate-950">
                {index + 1}
              </span>
              <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-[#0B1F3A] px-6 py-12 text-center sm:px-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-[#C9A227]/15 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
              <Ticket className="h-3.5 w-3.5 text-[#E7C65B]" />
              TicketHub
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {t("home.cta.title")}
            </h2>
            <p className="mt-2 text-sm text-slate-300">{t("home.cta.subtitle")}</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/events"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100 sm:w-auto"
              >
                {t("home.cta.button")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/guide"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
              >
                {t("home.cta.guide")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <p className="text-center text-xs leading-5 text-slate-400 dark:text-slate-500">
          {t("home.disclaimer")}
        </p>
      </section>
    </div>
  );
}
