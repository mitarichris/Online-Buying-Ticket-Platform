import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase();
  const category = searchParams.get("category");

  const where: Record<string, unknown> = {};

  if (query) {
    where.OR = [
      { title: { contains: query } },
      { category: { contains: query } },
      { city: { contains: query } },
      { venue: { contains: query } },
    ];
  }

  if (category?.trim()) {
    where.category = { contains: category };
  }

  const events = await prisma.event.findMany({
    where: Object.keys(where).length ? where : undefined,
    include: { ticketTypes: true },
  });

  return NextResponse.json(events);
}
