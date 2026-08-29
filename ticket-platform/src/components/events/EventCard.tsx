"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock } from "lucide-react";
import type { Event } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageProvider";

export function EventCard({ event }: { event: Event }) {
  const { t } = useLanguage();
  return (
    <Link href={`/events/${event.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-[16/9] bg-gray-200 dark:bg-gray-800">
          {event.image && (
            <Image
              src={event.image}
              alt={event.title}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
        </div>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">{event.title}</h3>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="info">{event.category}</Badge>
              {event.genre && <Badge variant="default">{event.genre}</Badge>}
            </div>
          </div>
          <div className="space-y-1.5 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>{event.venue}, {event.city}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-lg font-bold text-indigo-600">
              {t("event.from", { price: formatCurrency(Math.min(...event.ticketTypes.map((tt) => tt.price))) })}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
