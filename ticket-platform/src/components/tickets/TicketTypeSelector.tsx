"use client";

import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import type { TicketType } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageProvider";

interface TicketTypeSelectorProps {
  ticketType: TicketType;
  quantity: number;
  onQuantityChange: (ticketTypeId: string, quantity: number) => void;
}

export function TicketTypeSelector({ ticketType, quantity, onQuantityChange }: TicketTypeSelectorProps) {
  const { t } = useLanguage();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{ticketType.name}</h4>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{ticketType.description}</p>
          <p className="mt-1.5 text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(ticketType.price)}</p>
          <p className="mt-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            {t("event.availableCount", { count: ticketType.available })}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onQuantityChange(ticketType.id, Math.max(0, quantity - 1))}
            disabled={quantity === 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center text-sm font-semibold text-slate-900 dark:text-white">{quantity}</span>
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
    </div>
  );
}
