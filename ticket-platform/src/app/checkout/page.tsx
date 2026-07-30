"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

type PaymentState = "form" | "ussd" | "processing" | "success" | "failed";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentState, setPaymentState] = useState<PaymentState>("form");
  const [loading, setLoading] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [ussdPin, setUssdPin] = useState("");
  const [ussdStep, setUssdStep] = useState<"prompt" | "processing" | "done">("prompt");
  const pinInputRef = useRef<HTMLInputElement>(null);

  const total = getTotal() * 1.05;

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Please sign in to checkout");
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (paymentState === "ussd" && ussdStep === "prompt") {
      setTimeout(() => pinInputRef.current?.focus(), 500);
    }
  }, [paymentState, ussdStep]);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const orderPayload = {
        items: items.map((i) => ({
          eventId: i.eventId,
          eventTitle: i.eventTitle,
          ticketTypeId: i.ticketTypeId,
          ticketTypeName: i.ticketTypeName,
          quantity: i.quantity,
          unitPrice: i.price,
        })),
        total,
      };

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (!orderRes.ok) {
        const err = await orderRes.text();
        throw new Error(err);
      }

      const order = await orderRes.json();

      const payRes = await fetch("/api/mtn/request-to-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(total),
          phoneNumber: phone,
          orderId: order.id,
        }),
      });

      if (!payRes.ok) {
        const err = await payRes.text();
        throw new Error(err);
      }

      const data = await payRes.json();
      setReferenceId(data.referenceId);

      if (data.simulation) {
        setPaymentState("ussd");
        setUssdStep("prompt");
        setUssdPin("");
      } else {
        setPaymentState("processing");
        pollPaymentStatus(data.referenceId);
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
      setPaymentState("failed");
    } finally {
      setLoading(false);
    }
  }

  function handleUssdSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (ussdPin.length < 4) return;

    setUssdStep("processing");

    setTimeout(async () => {
      await fetch("/api/webhooks/intouch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesttransactionid: referenceId,
          transactionid: referenceId,
          status: "successful",
          responsecode: "2001",
          statusdesc: "Approved",
        }),
      });

      setUssdStep("done");
      setTimeout(() => pollPaymentStatus(referenceId), 800);
    }, 2000);
  }

  const pollPaymentStatus = useCallback(async (refId: string) => {
    const maxAttempts = 30;
    let attempts = 0;

    const poll = async () => {
      attempts++;
      try {
        const res = await fetch(`/api/mtn/status/${refId}`);
        if (!res.ok) throw new Error("Status check failed");

        const { status: txnStatus } = await res.json();

        if (txnStatus === "SUCCESSFUL") {
          setPaymentState("success");
          clearCart();
          toast.success("Payment successful!");
          setTimeout(() => router.push("/orders"), 1500);
          return;
        }

        if (txnStatus === "FAILED") {
          setPaymentState("failed");
          toast.error("Payment failed. Please try again.");
          return;
        }
      } catch {
        // continue polling
      }

      if (attempts < maxAttempts) {
        setTimeout(poll, 3000);
      } else {
        setPaymentState("failed");
        toast.error("Payment timed out. Check your orders.");
      }
    };

    setTimeout(poll, 1000);
  }, [clearCart, router]);

  if (status === "loading") {
    return <div className="mx-auto max-w-2xl px-4 py-8" />;
  }

  if (items.length === 0 && paymentState !== "processing" && paymentState !== "ussd") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Nothing to checkout</h1>
        <p className="mt-2 text-gray-500">Your cart is empty.</p>
        <Link href="/events"><Button className="mt-4">Browse Events</Button></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Checkout</h1>

      <div className="mb-8 space-y-3">
        {items.map((item) => (
          <div key={`${item.eventId}-${item.ticketTypeId}`} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
            <div>
              <p className="font-medium text-gray-900">{item.eventTitle}</p>
              <p className="text-sm text-gray-500">{item.ticketTypeName} x {item.quantity}</p>
            </div>
            <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
          </div>
        ))}
        <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-bold">
          <span>Total (incl. fees)</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">
            {paymentState === "form" && "Mobile Money Payment"}
            {paymentState === "ussd" && "Mobile Money"}
            {paymentState === "processing" && "Processing Payment"}
            {paymentState === "success" && "Payment Successful"}
            {paymentState === "failed" && "Payment Failed"}
          </h2>
        </CardHeader>
        <CardContent>
          {paymentState === "form" && (
            <form onSubmit={handlePay} className="space-y-4">
              <Input
                id="name"
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                id="phone"
                label="Mobile Money Number"
                placeholder="07XX XXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <p className="text-sm text-gray-500">
                A payment request will be sent to your phone.
              </p>
              <Button type="submit" loading={loading} size="lg" className="w-full">
                Pay {formatCurrency(total)} via Mobile Money
              </Button>
            </form>
          )}

          {paymentState === "ussd" && (
            <div className="flex justify-center py-4">
              <div className="w-72 overflow-hidden rounded-3xl border-4 border-gray-800 bg-gray-900 shadow-xl">
                <div className="flex items-center justify-center bg-gray-800 py-3">
                  <div className="h-3 w-20 rounded-full bg-gray-600" />
                </div>
                <div className="bg-gradient-to-b from-green-900 to-green-950 p-4 font-mono text-sm text-green-300 min-h-[320px] flex flex-col">
                  {ussdStep === "prompt" && (
                    <>
                      <div className="mb-4 text-center text-xs text-green-400">Mobile Money</div>
                      <div className="mb-3 space-y-1">
                        <p>Confirm payment:</p>
                        <p>Amount: <span className="text-green-200">{formatCurrency(total)}</span></p>
                        <p>From: {phone}</p>
                        <p className="mt-2">Enter PIN to authorize:</p>
                      </div>
                      <form onSubmit={handleUssdSubmit} className="mt-auto">
                        <div className="relative">
                          <input
                            ref={pinInputRef}
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            value={ussdPin}
                            onChange={(e) => setUssdPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            className="w-full bg-green-800/50 border border-green-600 rounded px-3 py-2 text-green-200 text-center text-lg tracking-widest outline-none focus:border-green-400 placeholder:text-green-700"
                            placeholder="* * * *"
                            autoFocus
                          />
                        </div>
                        <div className="mt-3 text-center text-xs text-green-500">
                          {ussdPin.length > 0 ? (
                            <span className="text-green-300">Press Send to confirm</span>
                          ) : (
                            "Enter your 4-digit PIN"
                          )}
                        </div>
                        <button
                          type="submit"
                          disabled={ussdPin.length < 4}
                          className="mt-3 w-full rounded bg-green-600 py-2 text-sm font-semibold text-white disabled:opacity-40 hover:bg-green-500 transition-colors"
                        >
                          Send
                        </button>
                      </form>
                    </>
                  )}
                  {ussdStep === "processing" && (
                    <div className="flex flex-col items-center justify-center flex-1">
                      <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-green-400 border-t-transparent" />
                      <p className="text-green-400">Processing...</p>
                      <p className="mt-1 text-xs text-green-600">Please wait</p>
                    </div>
                  )}
                  {ussdStep === "done" && (
                    <div className="flex flex-col items-center justify-center flex-1">
                      <div className="mb-2 text-2xl text-green-400">✓</div>
                      <p className="text-green-300">Approved</p>
                      <p className="mt-1 text-xs text-green-600">Confirming...</p>
                    </div>
                  )}
                  <div className="mt-auto border-t border-green-800 pt-2 text-xs text-green-600 text-center">
                    MTN Rwanda
                  </div>
                </div>
              </div>
            </div>
          )}

          {paymentState === "processing" && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
              <p className="text-gray-600">
                Payment request sent to your phone.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Open your mobile money menu and enter your PIN to confirm.
              </p>
            </div>
          )}

          {paymentState === "success" && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900">Payment Successful!</p>
              <p className="mt-1 text-sm text-gray-500">Redirecting to your orders...</p>
            </div>
          )}

          {paymentState === "failed" && (
            <div className="py-8 text-center">
              <p className="text-red-600">Payment was not completed.</p>
              <Button className="mt-4" onClick={() => setPaymentState("form")}>
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
