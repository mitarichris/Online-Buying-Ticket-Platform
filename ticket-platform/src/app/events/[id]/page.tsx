import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { EventHeroImage } from "./EventHeroImage";
import { EventDetailInfo } from "./EventDetailInfo";
import { EventBooking } from "./EventBooking";
import { EventBreadcrumb } from "./EventBreadcrumb";
import { EventTrustHints } from "./EventTrustHints";
import { getEventWithTicketTypes } from "@/lib/events";

export const dynamic = "force-dynamic";

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0d12]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <EventBreadcrumb title={eventData.title} />

        <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            {eventData.image && (
              <EventHeroImage src={eventData.image} alt={eventData.title} />
            )}

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="info" className="text-xs">{eventData.category}</Badge>
              {eventData.genre && (
                <Badge variant="default" className="text-xs">{eventData.genre}</Badge>
              )}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl dark:text-white">
              {eventData.title}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              {eventData.organizer}
            </p>

            <div className="mt-6">
              <EventDetailInfo event={eventData} />
            </div>
          </div>

          <aside className="h-fit lg:sticky lg:top-40">
            <EventBooking event={eventData} />
            <EventTrustHints />
          </aside>
        </div>
      </div>
    </div>
  );
}
