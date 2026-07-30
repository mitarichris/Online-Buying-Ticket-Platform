import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock } from "lucide-react";
import type { Event } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils";

export function EventCard({ event }: { event: Event }) {
  return (
    <Link href={`/events/${event.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-[16/9] bg-gray-200">
          {event.image && (
            <Image
              src={event.image}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
        </div>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900">{event.title}</h3>
            <Badge variant="info">{event.category}</Badge>
          </div>
          <div className="space-y-1.5 text-sm text-gray-500">
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
              From {formatCurrency(Math.min(...event.ticketTypes.map((t) => t.price)))}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
