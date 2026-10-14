import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFreeTicketBalance, FREE_TICKET_PROVIDER } from "@/lib/free-tickets";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true, user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { items, total, name, useFreeTicket } = await request.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    if (useFreeTicket) {
      const balance = await getFreeTicketBalance(session.user.id);
      if (balance.available < 1) {
        return NextResponse.json(
          { error: "No free tickets available" },
          { status: 403 }
        );
      }

      const freeOrder = await prisma.$transaction(
        async (tx) => {
          for (const item of items) {
            const ticketType = await tx.ticketType.findUnique({
              where: { id: item.ticketTypeId },
            });

            if (!ticketType || ticketType.available < item.quantity) {
              throw new Error(`Not enough tickets available for ${item.ticketTypeName}`);
            }
          }

          const created = await tx.order.create({
            data: {
              userId: session.user.id,
              buyerName: name || null,
              total: 0,
              status: "confirmed",
              paymentStatus: "successful",
              paymentProvider: FREE_TICKET_PROVIDER,
              items: {
                create: items.map((item: { eventId: string; eventTitle: string; ticketTypeId: string; ticketTypeName: string; quantity: number; unitPrice?: number; price?: number }) => ({
                  eventId: item.eventId,
                  eventTitle: item.eventTitle,
                  ticketTypeId: item.ticketTypeId,
                  ticketTypeName: item.ticketTypeName,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice || item.price || 0,
                })),
              },
            },
            include: { items: true },
          });

          for (const item of created.items) {
            await tx.ticketType.update({
              where: { id: item.ticketTypeId },
              data: { available: { decrement: item.quantity } },
            });
          }

          return created;
        },
        { maxWait: 20000, timeout: 30000 }
      );

      await prisma.notification
        .create({
          data: {
            userId: session.user.id,
            title: "Free Ticket Used",
            message: "Your free ticket was used and your booking is confirmed.",
          },
        })
        .catch(() => {});

      return NextResponse.json({ ...freeOrder, freeTicket: true }, { status: 201 });
    }

    const order = await prisma.$transaction(
      async (tx) => {
        for (const item of items) {
          const ticketType = await tx.ticketType.findUnique({
            where: { id: item.ticketTypeId },
          });

          if (!ticketType || ticketType.available < item.quantity) {
            throw new Error(`Not enough tickets available for ${item.ticketTypeName}`);
          }
        }

        return tx.order.create({
          data: {
            userId: session.user.id,
            buyerName: name || null,
            total,
            status: "pending",
            paymentStatus: "pending",
            items: {
              create: items.map((item: { eventId: string; eventTitle: string; ticketTypeId: string; ticketTypeName: string; quantity: number; unitPrice?: number; price?: number }) => ({
                eventId: item.eventId,
                eventTitle: item.eventTitle,
                ticketTypeId: item.ticketTypeId,
                ticketTypeName: item.ticketTypeName,
                quantity: item.quantity,
                unitPrice: item.unitPrice || item.price || 0,
              })),
            },
          },
          include: { items: true },
        });
      },
      { maxWait: 20000, timeout: 30000 }
    );

    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    console.error("Order error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create order" },
      { status: 500 }
    );
  }
}
