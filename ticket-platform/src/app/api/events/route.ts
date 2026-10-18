import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAllEventsWithTicketTypes, getEventsWithTicketTypes } from "@/lib/events";
import { invalidateCache } from "@/lib/cache";
import { notifyNewEvent } from "@/lib/notifications";
import { eventInputSchema } from "@/lib/event-schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase();
    const category = searchParams.get("category");
    const includeAll = searchParams.get("all") === "1";

    let events = await getEventsWithTicketTypes();

    if (includeAll) {
      const session = await auth();
      if (!session?.user?.isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      events = await getAllEventsWithTicketTypes();
    }

    if (category?.trim()) {
      events = events.filter((event) =>
        event.category.toLowerCase().includes(category.trim().toLowerCase())
      );
    }

    if (query) {
      events = events.filter((event) =>
        [event.title, event.category, event.city, event.venue].some((field) =>
          field.toLowerCase().includes(query)
        )
      );
    }

    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = eventInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid event data" },
      { status: 400 }
    );
  }

  const data = parsed.data;

  try {
    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time,
        venue: data.venue,
        address: data.address,
        city: data.city,
        category: data.category,
        organizer: data.organizer,
        genre: data.genre || null,
        image: data.image || null,
        ticketTypes: {
          create: data.ticketTypes.map((ticket) => ({
            name: ticket.name,
            price: ticket.price,
            quantity: ticket.quantity,
            available: ticket.available ?? ticket.quantity,
            description: ticket.description,
          })),
        },
      },
      include: { ticketTypes: true },
    });

    invalidateCache("events:list");

    let notified = 0;
    try {
      notified = await notifyNewEvent({
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
        venue: event.venue,
        city: event.city,
      });
    } catch (notifyError) {
      console.error("Failed to notify users about new event:", notifyError);
    }

    return NextResponse.json({ ...event, notified }, { status: 201 });
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
