import { NextResponse } from "next/server";
import { getEventsWithTicketTypes } from "@/lib/events";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase();
    const category = searchParams.get("category");

    let events = await getEventsWithTicketTypes();

    if (category?.trim()) {
      events = events.filter((event) =>
        event.category.toLowerCase().includes(category.trim().toLowerCase())
      );
    }

    if (query) {
      events = events.filter((event) =>
        [event.title, event.category, event.city, event.venue].some((field) =>
          field.toLowerCase().includes(query)
        )
      );
    }

    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
