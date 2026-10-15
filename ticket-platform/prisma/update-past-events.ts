import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaNeon } from "@prisma/adapter-neon";
import { parseEventDate, isPastEvent } from "../src/lib/event-date";
import "dotenv/config";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function main() {
  const events = await prisma.event.findMany({
    select: { id: true, title: true, date: true },
  });

  let updated = 0;

  for (const event of events) {
    if (!isPastEvent(event.date)) continue;

    const parsed = parseEventDate(event.date);
    if (!parsed) continue;

    const oldYear = parsed.getFullYear();
    let next = parsed;
    while (isPastEvent(toISODate(next))) {
      next = new Date(next.getFullYear() + 1, next.getMonth(), next.getDate());
    }

    const newDate = toISODate(next);
    const newYear = next.getFullYear();
    const newTitle = event.title.includes(String(oldYear))
      ? event.title.split(String(oldYear)).join(String(newYear))
      : event.title;

    await prisma.event.update({
      where: { id: event.id },
      data: { date: newDate, title: newTitle },
    });

    console.log(`${event.id}: "${event.title}" ${event.date} -> "${newTitle}" ${newDate}`);
    updated += 1;
  }

  console.log(`Done. Updated ${updated} past event(s).`);
}

main()
  .catch((error) => {
    console.error("Update failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
