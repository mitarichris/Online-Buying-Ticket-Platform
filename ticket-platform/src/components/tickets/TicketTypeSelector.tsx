"use client";

import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import type { TicketType } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface TicketTypeSelectorProps {
  ticketType: TicketType;
  quantity: number;
  onQuantityChange: (ticketTypeId: string, quantity: number) => void;
}

export function TicketTypeSelector({ ticketType, quantity, onQuantityChange }: TicketTypeSelectorProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-4">
      <div className="min-w-0 flex-1">
        <h4 className="font-medium text-gray-900 dark:text-white">{ticketType.name}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">{ticketType.description}</p>
        <p className="mt-1 text-lg font-bold text-[#B8942E]">{formatCurrency(ticketType.price)}</p>
      </div>
      <div className="flex items-center gap-3 sm:ml-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onQuantityChange(ticketType.id, Math.max(0, quantity - 1))}
          disabled={quantity === 0}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-8 text-center font-medium">{quantity}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onQuantityChange(ticketType.id, Math.min(ticketType.available, quantity + 1))}
          disabled={quantity >= ticketType.available}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
