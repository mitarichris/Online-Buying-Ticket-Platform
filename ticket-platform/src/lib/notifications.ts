import { prisma } from "@/lib/prisma";

export interface NotificationInput {
  title: string;
  message: string;
}

export async function createNotification(userId: string, input: NotificationInput) {
  return prisma.notification.create({
    data: { userId, title: input.title, message: input.message },
  });
}

export async function notifyAllUsers(input: NotificationInput): Promise<number> {
  const users = await prisma.user.findMany({ select: { id: true } });
  if (users.length === 0) return 0;

  const result = await prisma.notification.createMany({
    data: users.map((user) => ({
      userId: user.id,
      title: input.title,
      message: input.message,
    })),
  });

  return result.count;
}

export async function notifyNewEvent(event: {
  title: string;
  date?: string;
  time?: string;
  venue?: string;
  city?: string;
}): Promise<number> {
  const details = [event.date, event.time, event.venue || event.city]
    .filter(Boolean)
    .join(" · ");

  return notifyAllUsers({
    title: `New Event: ${event.title}`,
    message: details
      ? `A new upcoming event has been added — ${event.title} (${details}). Grab your tickets now!`
      : `A new upcoming event has been added — ${event.title}. Grab your tickets now!`,
  });
}
