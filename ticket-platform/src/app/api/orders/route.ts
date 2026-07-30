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
    const { items, total, paymentIntentId } = await request.json();

    const order = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const ticketType = await tx.ticketType.findUnique({
          where: { id: item.ticketTypeId },
        });

        if (!ticketType || ticketType.available < item.quantity) {
          throw new Error(`Not enough tickets available for ${item.ticketTypeName}`);
        }

        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: { available: { decrement: item.quantity } },
        });
      }

      return tx.order.create({
        data: {
          userId: session.user.id,
          total,
          status: "confirmed",
          paymentIntentId,
          items: {
            create: items.map((item: any) => ({
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
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("Order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
