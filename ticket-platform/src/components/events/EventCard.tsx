"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, Clock, MapPin, Ticket } from "lucide-react";
import type { Event } from "@/types";
import { formatCurrency, getDateParts, getMinPrice, getShortDate } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageProvider";

type TicketSummary = { price: number; available?: number };

export type EventCardEvent = Pick<Event, "id" | "title" | "date"> &
  Partial<Pick<Event, "image" | "time" | "venue" | "city" | "category" | "genre">> & {
    price?: number;
    ticketTypes?: TicketSummary[];
  };

export function EventCard({ event }: { event: EventCardEvent }) {
  const { t, locale } = useLanguage();
  const date = getDateParts(event.date, locale);
  const minPrice = getMinPrice(event.ticketTypes, event.price);
  const soldOut =
    event.ticketTypes && event.ticketTypes.length > 0
      ? event.ticketTypes.every((ticket) => (ticket.available ?? 1) <= 0)
      : false;
  const label = event.genre || event.category;

  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-800">
        {event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700">
            <Ticket className="h-10 w-10 text-slate-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />

        {label && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-slate-800 shadow-sm backdrop-blur">
            {label}
          </span>
        )}
        {soldOut && (
          <span className="absolute right-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
            {t("event.soldOut")}
          </span>
        )}

        {date && (
          <div className="absolute bottom-3 left-3 flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-white text-center shadow-lg">
            <span className="text-[10px] font-bold uppercase tracking-wide text-rose-600">
              {date.month}
            </span>
            <span className="text-xl font-extrabold leading-none text-slate-900">
              {date.day}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-700 sm:text-base dark:text-white dark:group-hover:text-blue-400">
          {event.title}
        </h3>

        <div className="mt-1.5 space-y-1 text-[11px] leading-snug text-slate-500 sm:mt-2 sm:text-xs dark:text-slate-400">
          <p className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {getShortDate(event.date, locale)}
              {event.time ? ` · ${event.time}` : ""}
            </span>
          </p>
          {event.venue && (
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {event.venue}
                {event.city ? `, ${event.city}` : ""}
              </span>
            </p>
          )}
        </div>

        <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-2.5 sm:mt-4 sm:flex-row sm:items-end sm:justify-between sm:gap-3 sm:pt-3 dark:border-slate-800">
          <div className="min-w-0">
            {minPrice !== undefined ? (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {t("event.fromLabel")}
                </p>
                <p className="text-sm font-bold text-slate-900 sm:text-base dark:text-white">
                  {formatCurrency(minPrice)}
                </p>
              </>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 sm:text-xs dark:text-slate-400">
                <CalendarDays className="h-3.5 w-3.5" />
                {t("home.viewDetails")}
              </span>
            )}
          </div>
          <span className="inline-flex w-full shrink-0 items-center justify-center gap-1 rounded-lg bg-blue-600 px-2.5 py-2 text-[11px] font-semibold text-white transition-colors group-hover:bg-blue-700 sm:w-auto sm:px-3 sm:text-xs">
            {t("home.getTickets")}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
