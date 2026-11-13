"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ticket as TicketIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TicketTypeSelector } from "@/components/tickets/TicketTypeSelector";
import { useCartStore } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Event } from "@/types";

export function EventBooking({ event }: { event: Event }) {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const addItem = useCartStore((s) => s.addItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const { t } = useLanguage();

  function handleQuantityChange(ticketTypeId: string, quantity: number) {
    setQuantities((prev) => ({ ...prev, [ticketTypeId]: quantity }));
  }

  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(quantities).reduce((sum, [ticketId, qty]) => {
    const ticket = event.ticketTypes.find((t) => t.id === ticketId);
    return sum + (ticket ? ticket.price * qty : 0);
  }, 0);

  function handleProceedToPayment() {
    let addedCount = 0;
    Object.entries(quantities).forEach(([ticketId, qty]) => {
      if (qty > 0) {
        const ticket = event.ticketTypes.find((t) => t.id === ticketId);
        if (ticket) {
          addedCount += qty;
        }
      }
    });

    if (addedCount > 0) {
      // The checkout must reflect only the current selection. Clear any items
      // left from a previous visit so quantities are not added twice when the
      // user goes back and proceeds to payment again.
      clearCart();
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
          }
        }
      });
      router.push("/checkout");
    } else {
      toast.error(t("event.selectOne"));
    }
  }

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm dark:border-slate-800">
      <CardContent className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <TicketIcon className="h-4 w-4" />
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("event.selectTickets")}
          </h2>
        </div>
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
          <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-800">
            <div className="mb-4 flex items-center justify-between text-lg">
              <span className="font-semibold text-slate-900 dark:text-white">{t("event.totalTickets", { count: totalItems })}</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        )}

        <Button
          size="lg"
          className="mt-6 w-full bg-blue-600 text-white hover:bg-blue-700"
          onClick={handleProceedToPayment}
          disabled={totalItems === 0}
        >
          {totalItems === 0 ? t("event.selectTickets") : t("event.proceedToPayment")}
        </Button>
      </CardContent>
    </Card>
  );
}
