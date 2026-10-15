import { prisma } from "@/lib/prisma";
import { cached, setCache } from "@/lib/cache";
import { isPastEvent } from "@/lib/event-date";
import type { Event } from "@/types";

const EVENTS_TTL_MS = 300_000;

function eventKey(id: string) {
  return `event:${id}`;
}

export async function getEventsWithTicketTypes(): Promise<Event[]> {
  return cached("events:list", async () => {
    const events = await prisma.event.findMany({
      include: { ticketTypes: true },
      orderBy: { createdAt: "desc" },
    });

    const normalized = events
      .filter((event) => !isPastEvent(event.date))
      .map((event) => ({
        ...event,
        genre: event.genre ?? undefined,
        image: event.image ?? undefined,
      }));

    for (const event of normalized) {
      setCache(eventKey(event.id), event, EVENTS_TTL_MS);
    }

    return normalized;
  });
}

export async function getEventWithTicketTypes(
  id: string
): Promise<Event | null> {
  const event = await cached(eventKey(id), () =>
    prisma.event.findUnique({
      where: { id },
      include: { ticketTypes: true },
    })
  );

  if (!event) {
    return null;
  }

  return { ...event, genre: event.genre ?? undefined, image: event.image ?? undefined };
}
