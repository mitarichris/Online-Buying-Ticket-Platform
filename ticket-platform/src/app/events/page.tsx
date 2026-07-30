"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { EventCard } from "@/components/events/EventCard";
import { EventSearch } from "@/components/events/EventSearch";
import type { Event } from "@/types";

export default function EventsPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (category) params.set("category", category);
      const qs = params.toString();
      const res = await fetch(`/api/events${qs ? `?${qs}` : ""}`);
      const data = await res.json();
      setEvents(data);
      setLoading(false);
    };

    const timer = setTimeout(fetchEvents, 300);
    return () => clearTimeout(timer);
  }, [search, category]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Events` : "Discover Events"}
        </h1>
        <p className="mt-2 text-gray-500">Find and book tickets for the best events near you.</p>
      </div>

      <div className="mb-8">
        <EventSearch value={search} onChange={setSearch} />
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white">
              <div className="aspect-[16/9] rounded-t-xl bg-gray-200" />
              <div className="space-y-3 p-4">
                <div className="h-5 w-3/4 rounded bg-gray-200" />
                <div className="h-4 w-1/2 rounded bg-gray-200" />
                <div className="h-4 w-2/3 rounded bg-gray-200" />
                <div className="h-4 w-1/3 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-gray-500">No events found. Try a different search.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
