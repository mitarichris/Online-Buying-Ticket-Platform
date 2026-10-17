import { prisma } from "@/lib/prisma";
import { cached } from "@/lib/cache";
import { isPastEvent } from "@/lib/event-date";
import type { Event } from "@/types";

const EVENTS_TTL_MS = 30_000;

export async function getEventsWithTicketTypes(): Promise<Event[]> {
  return cached(
    "events:list",
    async () => {
      const events = await prisma.event.findMany({
        include: { ticketTypes: true },
        orderBy: { createdAt: "desc" },
      });

      return events
        .filter((event) => !isPastEvent(event.date))
        .map((event) => ({
          ...event,
          genre: event.genre ?? undefined,
          image: event.image ?? undefined,
        }));
    },
    EVENTS_TTL_MS
  );
}

export async function getEventWithTicketTypes(
  id: string
): Promise<Event | null> {
  const event = await prisma.event.findUnique({
    where: { id },
    include: { ticketTypes: true },
  });

  if (!event) {
    return null;
  }

  return { ...event, genre: event.genre ?? undefined, image: event.image ?? undefined };
}
