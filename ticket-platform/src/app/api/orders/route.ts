import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
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
    const { items, total } = await request.json();

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
                unitPrice: item.unitPrice || item.price,
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
