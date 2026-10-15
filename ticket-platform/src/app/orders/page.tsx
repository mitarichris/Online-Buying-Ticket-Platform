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
  free_ticket: "Free Ticket",
};

function downloadReceipt(order: Order, buyerName: string) {
  const provider = PROVIDER_LABELS[order.paymentProvider ?? ""] || order.paymentProvider || "";
  const rows = order.items
    .map(
      (item, i) => `
        <tr style="background:${i % 2 === 0 ? "#ffffff" : "#f8fafc"}">
          <td style="padding:12px;border-bottom:1px solid #eef2f7;color:#0f172a">${item.eventTitle}</td>
          <td style="padding:12px;border-bottom:1px solid #eef2f7;color:#475569">${item.ticketTypeName}</td>
          <td style="padding:12px;border-bottom:1px solid #eef2f7;text-align:center;color:#475569">${item.quantity}</td>
          <td style="padding:12px;border-bottom:1px solid #eef2f7;text-align:right;color:#475569">${formatCurrency(item.unitPrice)}</td>
          <td style="padding:12px;border-bottom:1px solid #eef2f7;text-align:right;color:#0f172a;font-weight:600">${formatCurrency(item.unitPrice * item.quantity)}</td>
        </tr>`
    )
    .join("");

  const statusPill =
    order.status === "confirmed"
      ? { bg: "#ecfdf5", color: "#059669", label: "Confirmed" }
      : order.status === "pending"
      ? { bg: "#fffbeb", color: "#d97706", label: "Awaiting Payment" }
      : order.status === "cancelled"
      ? { bg: "#fef2f2", color: "#dc2626", label: "Cancelled" }
      : { bg: "#eef2ff", color: "#4f46e5", label: "Refunded" };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Receipt - ${order.id.slice(0, 8)}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 40px 16px; background: linear-gradient(135deg, #eef2ff 0%, #f8fafc 40%, #fefce8 100%); font-family: "Segoe UI", Arial, Helvetica, sans-serif; color: #0f172a; }
    .page { max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.25); }
    .header { background: linear-gradient(120deg, #0f172a 0%, #1e3a8a 60%, #2563eb 100%); color: #ffffff; padding: 40px 40px 28px; position: relative; overflow: hidden; }
    .header::before { content: ""; position: absolute; top: -60px; right: -60px; width: 200px; height: 200px; border-radius: 50%; background: rgba(250, 204, 21, 0.18); }
    .header::after { content: ""; position: absolute; bottom: -80px; left: 30%; width: 160px; height: 160px; border-radius: 50%; background: rgba(37, 99, 235, 0.25); }
    .brand { display: flex; align-items: center; gap: 12px; position: relative; z-index: 1; }
    .brand-icon { width: 46px; height: 46px; border-radius: 12px; background: linear-gradient(135deg, #facc15, #f59e0b); display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: 0 6px 16px rgba(250, 204, 21, 0.4); }
    .brand-name { font-size: 26px; font-weight: 800; letter-spacing: 0.5px; }
    .brand-name span { color: #facc15; }
    .header-sub { font-size: 13px; letter-spacing: 4px; text-transform: uppercase; color: #93c5fd; margin-top: 2px; position: relative; z-index: 1; }
    .gold-bar { height: 6px; background: linear-gradient(90deg, #facc15, #f59e0b, #facc15); }
    .body { padding: 28px 40px 32px; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .meta-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; }
    .meta-value { font-size: 15px; font-weight: 600; color: #0f172a; margin-top: 3px; }
    .pill { display: inline-block; padding: 5px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; }
    .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; margin: 28px 0 12px; }
    table { width: 100%; border-collapse: collapse; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06); }
    thead th { background: linear-gradient(90deg, #1e3a8a, #2563eb); color: #ffffff; text-align: left; padding: 12px 14px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
    tbody td { font-size: 14px; }
    .total-row { background: linear-gradient(120deg, #0f172a, #1e3a8a); border-radius: 14px; margin-top: 20px; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; color: #ffffff; }
    .total-label { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #93c5fd; }
    .total-amount { font-size: 28px; font-weight: 800; color: #facc15; margin-top: 2px; }
    .barcode-zone { display: flex; align-items: center; justify-content: center; margin-top: 26px; }
    .barcode { font-family: "Courier New", monospace; font-size: 15px; letter-spacing: 2px; color: #0f172a; padding: 10px 18px; background: #f1f5f9; border: 1px dashed #cbd5e1; border-radius: 10px; }
    .footer { padding: 22px 40px 30px; text-align: center; border-top: 2px dashed #e2e8f0; position: relative; }
    .footer::before, .footer::after { content: ""; position: absolute; top: -11px; width: 22px; height: 22px; border-radius: 50%; background: #f8fafc; }
    .footer::before { left: -11px; }
    .footer::after { right: -11px; }
    .footer-thanks { font-size: 15px; font-weight: 700; color: #1e3a8a; }
    .footer-note { font-size: 12px; color: #94a3b8; margin-top: 6px; }
    .footer-brand { font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #2563eb; margin-top: 14px; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="brand">
        <div class="brand-icon">&#127915;</div>
        <div>
          <div class="brand-name">Ticket<span>Hub</span></div>
          <div class="header-sub">Payment Receipt</div>
        </div>
      </div>
    </div>
    <div class="gold-bar"></div>
    <div class="body">
      <div class="meta">
        <div>
          <div class="meta-label">Order</div>
          <div class="meta-value">#${order.id.slice(0, 8)}</div>
        </div>
        <div>
          <div class="meta-label">Customer</div>
          <div class="meta-value">${buyerName}</div>
        </div>
        <div>
          <div class="meta-label">Date</div>
          <div class="meta-value">${new Date(order.createdAt).toLocaleString()}</div>
        </div>
        <div>
          <div class="meta-label">Status</div>
          <div class="meta-value"><span class="pill" style="background:${statusPill.bg};color:${statusPill.color}">${statusPill.label}</span></div>
        </div>
        ${provider ? `<div>
          <div class="meta-label">Payment Method</div>
          <div class="meta-value">${provider}</div>
        </div>` : ""}
      </div>

      <div class="section-title">Ticket Summary</div>
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

      <div class="total-row">
        <div>
          <div class="total-label">Total Paid</div>
          <div class="total-amount">${formatCurrency(order.total)}</div>
        </div>
        <div style="font-size:40px">&#129534;</div>
      </div>

      <div class="barcode-zone">
        <div class="barcode">&#9616;&nbsp;&#9616;&nbsp;&#9608;&#9600;&#9608;&#9600;&#9608;&#9608;&#9600;&#9608;&nbsp;${order.id.replace(/-/g, "").slice(0, 12)}&#9616;&#9600;&#9608;&#9600;&#9608;&#9608;&#9600;&#9608;&#9608;</div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-thanks">Thank you for using TicketHub!</div>
      <div class="footer-note">This receipt confirms your ticket purchase. Please keep it for your records.</div>
      <div class="footer-brand">TicketHub &bull; Book. Pay. Enjoy.</div>
    </div>
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
  const { t, locale } = useLanguage();
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

  const getBuyerName = (order: Order) => order.buyerName || order.user?.name || session?.user?.name || "-";

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
                          {order.paymentProvider === "free_ticket"
                            ? t("provider.freeTicket")
                            : PROVIDER_LABELS[order.paymentProvider] || order.paymentProvider}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                      <p>{t("orders.buyer", { name: getBuyerName(order) })}</p>
                      {order.items.map((item, i) => (
                        <p key={i}>{item.eventTitle} - {item.ticketTypeName} x {item.quantity}</p>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(order.createdAt, locale)}
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
                          onClick={() => downloadReceipt(order, getBuyerName(order))}
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
