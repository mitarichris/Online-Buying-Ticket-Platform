import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invalidateCache } from "@/lib/cache";
import { eventInputSchema } from "@/lib/event-schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: { ticketTypes: true },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(event);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

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

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  try {
    const event = await prisma.$transaction(async (tx) => {
      const newTickets = data.ticketTypes.filter((ticket) => !ticket.id);
      const existingTickets = data.ticketTypes.filter((ticket) => ticket.id);

      const updated = await tx.event.update({
        where: { id },
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
          ...(newTickets.length > 0
            ? {
                ticketTypes: {
                  create: newTickets.map((ticket) => ({
                    name: ticket.name,
                    price: ticket.price,
                    quantity: ticket.quantity,
                    available: ticket.available ?? ticket.quantity,
                    description: ticket.description,
                  })),
                },
              }
            : {}),
        },
        include: { ticketTypes: true },
      });

      for (const ticket of existingTickets) {
        await tx.ticketType.updateMany({
          where: { id: ticket.id as string, eventId: id },
          data: {
            name: ticket.name,
            price: ticket.price,
            quantity: ticket.quantity,
            ...(ticket.available !== undefined ? { available: ticket.available } : {}),
            description: ticket.description,
          },
        });
      }

      return tx.event.findUnique({
        where: { id },
        include: { ticketTypes: true },
      }) ?? updated;
    });

    invalidateCache("events:list");

    return NextResponse.json(event);
  } catch (error) {
    console.error("Failed to update event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}
