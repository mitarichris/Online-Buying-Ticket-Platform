"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Calendar, Clock, MapPin, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TicketTypeSelector } from "@/components/tickets/TicketTypeSelector";
import { useCartStore } from "@/store/cart";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Event } from "@/types";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    fetch(`/api/events/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);
        const initial: Record<string, number> = {};
        data.ticketTypes.forEach((t: any) => { initial[t.id] = 0; });
        setQuantities(initial);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  function handleQuantityChange(ticketTypeId: string, quantity: number) {
    setQuantities((prev) => ({ ...prev, [ticketTypeId]: quantity }));
  }

  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);
  const totalPrice = event
    ? Object.entries(quantities).reduce((sum, [ticketId, qty]) => {
        const ticket = event.ticketTypes.find((t) => t.id === ticketId);
        return sum + (ticket ? ticket.price * qty : 0);
      }, 0)
    : 0;

  function handleAddToCart() {
    if (!event) return;

    let addedCount = 0;
    Object.entries(quantities).forEach(([ticketId, qty]) => {
      if (qty > 0) {
        const ticket = event.ticketTypes.find((t) => t.id === ticketId);
        if (ticket) {
          addItem({
            eventId: event.id,
            eventTitle: event.title,
            eventDate: event.date,
            eventImage: event.image || "",
            ticketTypeId: ticket.id,
            ticketTypeName: ticket.name,
            price: ticket.price,
            quantity: qty,
          });
          addedCount += qty;
        }
      }
    });

    if (addedCount > 0) {
      toast.success(`${addedCount} ticket(s) added to cart!`);
    } else {
      toast.error("Please select at least one ticket.");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-2/3 rounded bg-gray-200" />
          <div className="h-4 w-1/3 rounded bg-gray-200" />
          <div className="h-48 w-full rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-gray-500">Event not found.</p>
        <Button className="mt-4" onClick={() => router.push("/events")}>
          Browse Events
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {event.image && (
        <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-xl bg-gray-200">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <Badge variant="info" className="text-sm">{event.category}</Badge>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">{event.title}</h1>
        <p className="mt-2 text-lg text-gray-500">{event.organizer}</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
          <Calendar className="h-5 w-5 text-indigo-600" />
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium">{formatDate(event.date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
          <Clock className="h-5 w-5 text-indigo-600" />
          <div>
            <p className="text-sm text-gray-500">Time</p>
            <p className="font-medium">{event.time}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
          <MapPin className="h-5 w-5 text-indigo-600" />
          <div>
            <p className="text-sm text-gray-500">Venue</p>
            <p className="font-medium">{event.venue}</p>
          </div>
        </div>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="mb-3 text-xl font-semibold text-gray-900">About This Event</h2>
          <p className="text-gray-600 leading-relaxed">{event.description}</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <Building className="h-4 w-4" />
            <span>{event.address}, {event.city}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">Select Tickets</h2>
          <div className="space-y-4">
            {event.ticketTypes.map((ticket) => (
              <TicketTypeSelector
                key={ticket.id}
                ticketType={ticket}
                quantity={quantities[ticket.id] || 0}
                onQuantityChange={handleQuantityChange}
              />
            ))}
          </div>

          {totalItems > 0 && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="mb-4 flex items-center justify-between text-lg">
                <span className="font-semibold text-gray-900">Total ({totalItems} tickets)</span>
                <span className="font-bold text-indigo-600">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          )}

          <Button
            size="lg"
            className="mt-6 w-full"
            onClick={handleAddToCart}
            disabled={totalItems === 0}
          >
            {totalItems === 0 ? "Select Tickets" : `Add ${totalItems} Ticket(s) to Cart`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
