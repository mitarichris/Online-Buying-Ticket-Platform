"use client";

import { Calendar, Clock, MapPin, Building } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageProvider";
import { EventBooking } from "./EventBooking";
import type { Event } from "@/types";

export function EventDetailInfo({ event }: { event: Event }) {
  const { t } = useLanguage();

  return (
    <>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
          <Calendar className="h-5 w-5 text-[#B8942E]" />
          <div>
            <p className="text-sm text-gray-500">{t("event.date")}</p>
            <p className="font-medium">{formatDate(event.date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
          <Clock className="h-5 w-5 text-[#B8942E]" />
          <div>
            <p className="text-sm text-gray-500">{t("event.time")}</p>
            <p className="font-medium">{event.time}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
          <MapPin className="h-5 w-5 text-[#B8942E]" />
          <div>
            <p className="text-sm text-gray-500">{t("event.venue")}</p>
            <p className="font-medium">{event.venue}</p>
          </div>
        </div>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">{t("event.about")}</h2>
          <p className="text-gray-600 leading-relaxed dark:text-gray-300">{event.description}</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Building className="h-4 w-4" />
            <span>{event.address}, {event.city}</span>
          </div>
        </CardContent>
      </Card>

      <EventBooking event={event} />
    </>
  );
}
