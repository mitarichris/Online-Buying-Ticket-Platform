import { prisma } from "@/lib/prisma";

export const PAID_BOOKINGS_PER_FREE_TICKET = 10;
export const FREE_TICKET_PROVIDER = "free_ticket";

export interface FreeTicketBalance {
  earned: number;
  used: number;
  available: number;
  paidBookings: number;
  progress: number;
  remaining: number;
}

export async function getFreeTicketBalance(
  userId: string
): Promise<FreeTicketBalance> {
  const [paidBookings, used] = await Promise.all([
    prisma.order.count({
      where: {
        userId,
        paymentStatus: "successful",
        NOT: { paymentProvider: FREE_TICKET_PROVIDER },
      },
    }),
    prisma.order.count({
      where: { userId, paymentProvider: FREE_TICKET_PROVIDER },
    }),
  ]);

  const earned = Math.floor(paidBookings / PAID_BOOKINGS_PER_FREE_TICKET);
  const available = Math.max(0, earned - used);
  const progress = paidBookings % PAID_BOOKINGS_PER_FREE_TICKET;
  const remaining = PAID_BOOKINGS_PER_FREE_TICKET - progress;

  return { earned, used, available, paidBookings, progress, remaining };
}
