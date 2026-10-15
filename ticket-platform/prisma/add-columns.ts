import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const statements = [
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`,
  `ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "eventId" TEXT`,
];

async function main() {
  const sql = neon(process.env.DATABASE_URL as string);
  for (const stmt of statements) {
    await sql.query(stmt);
    console.log(`✓ ${stmt}`);
  }
  console.log("Schema columns added successfully!");
}

main().catch((e) => {
  console.error("Failed to add columns:", e.message);
  process.exit(1);
});
