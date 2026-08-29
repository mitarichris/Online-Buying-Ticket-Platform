import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { EventHeroImage } from "./EventHeroImage";
import { EventDetailInfo } from "./EventDetailInfo";
import { getEventsWithTicketTypes, getEventWithTicketTypes } from "@/lib/events";

export const revalidate = 300;

export async function generateStaticParams() {
  const events = await getEventsWithTicketTypes();
  return events.map((event) => ({ id: event.id }));
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const event = await getEventWithTicketTypes(id);

  if (!event) {
    notFound();
  }

  const eventData = { ...event, image: event.image ?? undefined };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {eventData.image && (
        <EventHeroImage src={eventData.image} alt={eventData.title} />
      )}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <Badge variant="info" className="text-sm">{eventData.category}</Badge>
          {eventData.genre && (
            <Badge variant="default" className="text-sm">{eventData.genre}</Badge>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl dark:text-white">{eventData.title}</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">{eventData.organizer}</p>
      </div>

      <EventDetailInfo event={eventData} />
    </div>
  );
}
