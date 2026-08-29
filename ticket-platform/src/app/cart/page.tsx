"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/store/cart";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const { t } = useLanguage();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" />
        <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">{t("cart.empty")}</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{t("cart.emptyHint")}</p>
        <Link href="/events">
          <Button className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("cart.continue")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("cart.title")}</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">{t("cart.items", { count: items.length })}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={clearCart}>
          {t("cart.clearAll")}
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <Card key={`${item.eventId}-${item.ticketTypeId}`}>
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-4">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                {item.eventImage ? (
                  <Image src={item.eventImage} alt={item.eventTitle} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/events/${item.eventId}`} className="font-semibold text-gray-900 dark:text-white hover:text-indigo-600">
                  {item.eventTitle}
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(item.eventDate)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.ticketTypeName}</p>
                <p className="mt-1 font-medium text-indigo-600">{t("cart.each", { price: formatCurrency(item.price) })}</p>
              </div>
              <div className="flex items-center gap-2 sm:ml-auto">
                <Button variant="outline" size="sm" onClick={() => updateQuantity(item.eventId, item.ticketTypeId, item.quantity - 1)}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <Button variant="outline" size="sm" onClick={() => updateQuantity(item.eventId, item.ticketTypeId, item.quantity + 1)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(item.price * item.quantity)}</p>
                <Button variant="ghost" size="sm" onClick={() => removeItem(item.eventId, item.ticketTypeId)} className="mt-1 text-red-500 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>{t("cart.subtotal")}</span>
              <span>{formatCurrency(getTotal())}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>{t("cart.serviceFee")}</span>
              <span>{formatCurrency(getTotal() * 0.05)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                <span>{t("cart.total")}</span>
                <span>{formatCurrency(getTotal() * 1.05)}</span>
              </div>
            </div>
          </div>
          <Link href="/checkout">
            <Button size="lg" className="mt-6 w-full">
              {t("cart.checkout")}
            </Button>
          </Link>
          <div className="mt-3 text-center">
            <Link href="/events" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              {t("cart.continue")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
