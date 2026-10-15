import { prisma } from "@/lib/prisma";
import { parseEventDate } from "@/lib/event-date";

const REMINDER_WINDOW_DAYS = 3;

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function daysUntil(dateValue: string): number | null {
  const parsed = parseEventDate(dateValue);
  if (!parsed) return null;
  const eventDay = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  return Math.round((eventDay.getTime() - startOfToday().getTime()) / 86_400_000);
}

function whenText(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

/**
 * Creates reminder notifications for events happening soon (today or within the
 * next few days) so users do not miss out. Reminders are generated lazily the
 * next time the user loads their notifications, and only once per event.
 */
export async function generateEventReminders(userId: string): Promise<number> {
  const events = await prisma.event.findMany({
    select: { id: true, title: true, date: true, time: true, venue: true, city: true },
  });

  const upcoming = events
    .map((event) => ({ event, days: daysUntil(event.date) ?? -1 }))
    .filter((entry) => entry.days >= 0 && entry.days <= REMINDER_WINDOW_DAYS);

  if (upcoming.length === 0) return 0;

  const eventIds = upcoming.map((entry) => entry.event.id);

  const existingReminders = await prisma.notification.findMany({
    where: { userId, eventId: { in: eventIds } },
    select: { eventId: true },
  });
  const alreadyReminded = new Set(existingReminders.map((n) => n.eventId));

  const booked = await prisma.orderItem.findMany({
    where: {
      eventId: { in: eventIds },
      order: { userId, OR: [{ status: "confirmed" }, { paymentStatus: "successful" }] },
    },
    select: { eventId: true },
  });
  const alreadyBooked = new Set(booked.map((o) => o.eventId));

  let created = 0;

  for (const { event, days } of upcoming) {
    if (alreadyReminded.has(event.id) || alreadyBooked.has(event.id)) continue;

    const when = whenText(days);
    const details = [event.time, event.venue || event.city].filter(Boolean).join(" · ");

    await prisma.notification.create({
      data: {
        userId,
        eventId: event.id,
        title: `Reminder: ${event.title} is ${when}!`,
        message: details
          ? `Don't miss out — ${event.title} is happening ${when} (${details}). Book your ticket now!`
          : `Don't miss out — ${event.title} is happening ${when}. Book your ticket now!`,
      },
    });

    created += 1;
  }

  return created;
}
