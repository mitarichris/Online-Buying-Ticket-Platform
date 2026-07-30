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

export default function OrdersPage() {
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
            <div key={i} className="h-32 rounded-xl bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">My Orders</h1>

      {orders.length === 0 ? (
        <div className="py-16 text-center">
          <Ticket className="mx-auto h-16 w-16 text-gray-300" />
          <p className="mt-4 text-lg text-gray-500">No orders yet.</p>
          <Link href="/events">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse Events
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
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-gray-900">Order #{order.id.slice(0, 8)}</p>
                      <Badge
                        variant={
                          order.status === "confirmed" ? "success" :
                          order.status === "pending" ? "warning" :
                          order.status === "cancelled" ? "danger" : "default"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-gray-500">
                      {order.items.map((item, i) => (
                        <p key={i}>{item.eventTitle} - {item.ticketTypeName} x {item.quantity}</p>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(order.total)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
