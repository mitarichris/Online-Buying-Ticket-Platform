"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Calendar, Ticket, ArrowLeft } from "lucide-react";
import type { Order } from "@/types";
import { useLanguage } from "@/i18n/LanguageProvider";

const PROVIDER_LABELS: Record<string, string> = {
  mtn: "MTN MoMo",
  airtel: "Airtel Money",
};

const STATUS_KEYS: Record<string, string> = {
  pending: "orders.status.pending",
  confirmed: "orders.status.confirmed",
  cancelled: "orders.status.cancelled",
  refunded: "orders.status.refunded",
};

export default function OrdersPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  useEffect(() => {
    if (session) {
      fetch("/api/orders")
        .then((res) => res.json())
        .then((data) => {
          setOrders(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">{t("orders.title")}</h1>

      {orders.length === 0 ? (
        <div className="py-16 text-center">
          <Ticket className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" />
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">{t("orders.empty")}</p>
          <Link href="/events">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("orders.browse")}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-semibold text-gray-900 dark:text-white">{t("orders.order", { id: order.id.slice(0, 8) })}</p>
                      <Badge
                        variant={
                          order.status === "confirmed" ? "success" :
                          order.status === "pending" ? "warning" :
                          order.status === "cancelled" ? "danger" : "default"
                        }
                      >
                        {STATUS_KEYS[order.status] ? t(STATUS_KEYS[order.status]) : order.status}
                      </Badge>
                      {order.paymentProvider && (
                        <Badge variant="info">
                          {PROVIDER_LABELS[order.paymentProvider] || order.paymentProvider}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                      {order.items.map((item, i) => (
                        <p key={i}>{item.eventTitle} - {item.ticketTypeName} x {item.quantity}</p>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(order.total)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
