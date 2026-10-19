import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const statements = [
  `CREATE TABLE IF NOT EXISTS "EventImage" (
    "id" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventImage_pkey" PRIMARY KEY ("id")
)`,
];

async function main() {
  const sql = neon(process.env.DATABASE_URL as string);
  for (const stmt of statements) {
    await sql.query(stmt);
    console.log(`✓ ${stmt.split("\n")[0]}`);
  }
  console.log("EventImage table created successfully!");
}

main().catch((e) => {
  console.error("Failed to add EventImage table:", e.message);
  process.exit(1);
});
