import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaNeon } from "@prisma/adapter-neon";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const events = await prisma.event.findMany({ select: { id: true, title: true } });
  const sorted = [...events].sort((a, b) => b.title.length - a.title.length);

  const notifications = await prisma.notification.findMany({
    where: { eventId: null },
    select: { id: true, title: true },
  });

  let updated = 0;
  for (const notification of notifications) {
    const match = sorted.find(
      (event) => event.title && notification.title.includes(event.title)
    );
    if (match) {
      await prisma.notification.update({
        where: { id: notification.id },
        data: { eventId: match.id },
      });
      updated += 1;
      console.log(`linked "${notification.title}" -> ${match.id}`);
    }
  }

  console.log(`Done. Linked ${updated} notification(s).`);
}

main()
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
