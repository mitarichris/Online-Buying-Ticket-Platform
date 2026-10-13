import { prisma } from "@/lib/prisma";

export async function confirmOrderPayment(
  orderId: string,
  opts: { provider?: string; paymentId?: string } = {}
): Promise<boolean> {
  const confirmed = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({
      where: { id: orderId, paymentStatus: "pending" },
      data: {
        paymentStatus: "successful",
        status: "confirmed",
        ...(opts.provider ? { paymentProvider: opts.provider } : {}),
        ...(opts.paymentId ? { paymentIntentId: opts.paymentId } : {}),
      },
    });

    if (updated.count === 0) {
      return false;
    }

    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: { items: true },
    });

    if (order) {
      for (const item of order.items) {
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: { available: { decrement: item.quantity } },
        });
      }
    }

    return true;
  });

  if (confirmed) {
    const order = await prisma.order
      .findUnique({ where: { id: orderId }, select: { userId: true } })
      .catch(() => null);

    if (order?.userId) {
      await prisma.notification
        .create({
          data: {
            userId: order.userId,
            title: "Payment Successful",
            message: "Your payment was successful. Your tickets are ready in My Orders.",
          },
        })
        .catch(() => {});
    }
  }

  return confirmed;
}

export async function failOrderPayment(
  orderId: string,
  status: "failed" | "cancelled" = "failed"
): Promise<void> {
  await prisma.order
    .updateMany({
      where: { id: orderId, paymentStatus: "pending" },
      data: { paymentStatus: status, status: "cancelled" },
    })
    .catch(() => {});
}
