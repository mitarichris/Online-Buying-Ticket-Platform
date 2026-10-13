"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Calendar, Download, Ticket, ArrowLeft } from "lucide-react";
import type { Order } from "@/types";
import { useLanguage } from "@/i18n/LanguageProvider";

const PROVIDER_LABELS: Record<string, string> = {
  mtn: "MTN MoMo",
  airtel: "Airtel Money",
};

function downloadReceipt(order: Order, buyerName: string) {
  const provider = PROVIDER_LABELS[order.paymentProvider ?? ""] || order.paymentProvider || "";
  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${item.eventTitle}</td>
          <td style="padding:8px;border-bottom:1px solid #eee">${item.ticketTypeName}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatCurrency(item.unitPrice)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatCurrency(item.unitPrice * item.quantity)}</td>
        </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Receipt - ${order.id.slice(0, 8)}</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; padding: 32px; }
    .receipt { max-width: 640px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 32px; }
    h1 { margin: 0; font-size: 22px; }
    .meta { color: #555; margin-bottom: 24px; }
    .meta p { margin: 2px 0; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { text-align: left; padding: 8px; background: #f5f5f5; border-bottom: 2px solid #ddd; }
    .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 16px; }
    .footer { margin-top: 24px; color: #777; font-size: 13px; }
  </style>
</head>
<body>
  <div class="receipt">
    <h1>TicketHub - Payment Receipt</h1>
    <div class="meta">
      <p><strong>Order:</strong> ${order.id}</p>
      <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
      <p><strong>Customer:</strong> ${buyerName}</p>
      ${provider ? `<p><strong>Payment Method:</strong> ${provider}</p>` : ""}
      <p><strong>Status:</strong> ${order.status}</p>
    </div>
    <table>
      <thead>
        <tr>
          <th>Event</th>
          <th>Ticket Type</th>
          <th style="text-align:center">Qty</th>
          <th style="text-align:right">Unit Price</th>
          <th style="text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="total">Amount Paid: ${formatCurrency(order.total)}</p>
    <p class="footer">Thank you for using TicketHub!</p>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `receipt-${order.id.slice(0, 8)}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

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
                      <p>{t("orders.buyer", { name: order.user?.name || session?.user?.name || "-" })}</p>
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
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">{t("orders.amountPaid")}</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(order.total)}</p>
                      </div>
                      {order.status === "confirmed" && (
                        <Button
                          variant="outline"
                          onClick={() => downloadReceipt(order, order.user?.name || session?.user?.name || "-")}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          {t("orders.downloadReceipt")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
