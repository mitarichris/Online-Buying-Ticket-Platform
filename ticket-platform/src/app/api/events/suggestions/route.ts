import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPastEvent } from "@/lib/event-date";
import type { EventSuggestion } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { category: { contains: query, mode: "insensitive" } },
          { city: { contains: query, mode: "insensitive" } },
          { venue: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        category: true,
        city: true,
        image: true,
        date: true,
      },
      take: 20,
    });

    const lower = query.toLowerCase();
    const ranked = events
      .filter((event) => !isPastEvent(event.date))
      .map((event) => {
        const title = event.title.toLowerCase();
        let score = 3;
        if (title.startsWith(lower)) score = 0;
        else if (title.includes(lower)) score = 1;
        return { event, score };
      })
      .sort((a, b) => a.score - b.score || a.event.title.localeCompare(b.event.title))
      .slice(0, 8)
      .map(({ event }) => ({
        id: event.id,
        title: event.title,
        category: event.category,
        city: event.city,
        image: event.image,
      } as EventSuggestion));

    return NextResponse.json(ranked);
  } catch (error) {
    console.error("Failed to fetch suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
