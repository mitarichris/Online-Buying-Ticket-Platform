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
import { useLanguage } from "@/i18n/LanguageProvider";

type PaymentState = "form" | "ussd" | "processing" | "success" | "failed";
type Provider = "mtn" | "airtel";

const PROVIDERS: Record<Provider, { name: string; color: string; bg: string; border: string; text: string; ussdBg: string; ussdAccent: string; footer: string }> = {
  mtn: {
    name: "MTN MoMo",
    color: "#FFCC00",
    bg: "bg-[#FFCC00]",
    border: "border-[#FFCC00]",
    text: "text-[#000000]",
    ussdBg: "from-yellow-900 to-yellow-950",
    ussdAccent: "text-yellow-300",
    footer: "MTN Rwanda",
  },
  airtel: {
    name: "Airtel Money",
    color: "#ED1C24",
    bg: "bg-[#ED1C24]",
    border: "border-[#ED1C24]",
    text: "text-white",
    ussdBg: "from-red-900 to-red-950",
    ussdAccent: "text-red-300",
    footer: "Airtel Money",
  },
};

export default function CheckoutPage() {
  const { status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const { items, getTotal, clearCart } = useCartStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [provider, setProvider] = useState<Provider | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>("form");
  const [loading, setLoading] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [ussdPin, setUssdPin] = useState("");
  const [ussdStep, setUssdStep] = useState<"prompt" | "processing" | "done">("prompt");
  const pinInputRef = useRef<HTMLInputElement>(null);

  const total = getTotal() * 1.05;

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error(t("checkout.signinToCheckout"));
      router.push("/login");
    }
  }, [status, router, t]);

  useEffect(() => {
    if (paymentState === "ussd" && ussdStep === "prompt") {
      setTimeout(() => pinInputRef.current?.focus(), 500);
    }
  }, [paymentState, ussdStep]);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!provider) {
      toast.error(t("checkout.selectMethod"));
      return;
    }
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
      setOrderId(order.id);

      const payRes = await fetch("/api/mtn/request-to-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(total),
          phoneNumber: phone,
          orderId: order.id,
          provider,
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
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("checkout.somethingWentWrong"));
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
      setTimeout(() => pollPaymentStatus(referenceId), 300);
    }, 800);
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
          toast.success(t("checkout.paySuccess"));
          setTimeout(() => router.push("/orders"), 800);
          return;
        }

        if (txnStatus === "FAILED") {
          setPaymentState("failed");
          toast.error(t("checkout.payFailed"));
          return;
        }
      } catch {
        // continue polling
      }

      if (attempts < maxAttempts) {
        setTimeout(poll, 3000);
      } else {
        if (orderId) {
          await fetch(`/api/orders/${orderId}`, { method: "PATCH" }).catch(() => {});
        }
        setPaymentState("failed");
        toast.error(t("checkout.payTimedOut"));
      }
    };

    setTimeout(poll, 400);
  }, [clearCart, router, orderId, t]);

  if (status === "loading") {
    return <div className="mx-auto max-w-2xl px-4 py-8" />;
  }

  if (items.length === 0 && paymentState !== "processing" && paymentState !== "ussd") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("checkout.empty")}</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{t("checkout.cartEmpty")}</p>
        <Link href="/events"><Button className="mt-4">{t("checkout.browse")}</Button></Link>
      </div>
    );
  }

  const p = provider ? PROVIDERS[provider] : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">{t("checkout.title")}</h1>

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
        <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-bold text-gray-900 dark:text-white">
          <span>{t("checkout.totalFees")}</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {paymentState === "form" && t("checkout.state.payment")}
            {paymentState === "ussd" && (p ? p.name : t("checkout.state.mobile"))}
            {paymentState === "processing" && t("checkout.state.processing")}
            {paymentState === "success" && t("checkout.state.success")}
            {paymentState === "failed" && t("checkout.state.failed")}
          </h2>
        </CardHeader>
        <CardContent>
          {paymentState === "form" && (
            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("checkout.method")}</label>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(PROVIDERS) as Provider[]).map((key) => {
                    const prov = PROVIDERS[key];
                    const isSelected = provider === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setProvider(key)}
                        className={`relative flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all ${
                          isSelected
                            ? `${prov.border} ${prov.bg} ${prov.text} shadow-md`
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {prov.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Input
                id="name"
                label={t("checkout.fullName")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                id="phone"
                label={t("checkout.momoNumber")}
                placeholder={t("checkout.phonePlaceholder")}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("checkout.sent", { provider: provider ? PROVIDERS[provider].name : t("checkout.state.mobile") })}
              </p>
              <Button type="submit" loading={loading} size="lg" className="w-full">
                {t("checkout.pay", { amount: formatCurrency(total), provider: provider ? PROVIDERS[provider].name : t("checkout.state.mobile") })}
              </Button>
            </form>
          )}

          {paymentState === "ussd" && p && (
            <div className="flex justify-center py-4">
              <div className="w-full max-w-[288px] overflow-hidden rounded-3xl border-4 border-gray-800 bg-gray-900 shadow-xl">
                <div className="flex items-center justify-center bg-gray-800 py-3">
                  <div className="h-3 w-20 rounded-full bg-gray-600" />
                </div>
                <div className={`bg-gradient-to-b ${p.ussdBg} p-4 font-mono text-sm min-h-[320px] flex flex-col`}>
                  {ussdStep === "prompt" && (
                    <>
                      <div className={`mb-4 text-center text-xs ${p.ussdAccent}`}>{p.name}</div>
                      <div className="mb-3 space-y-1 text-gray-300">
                        <p>{t("checkout.confirm")}</p>
                        <p>{t("checkout.amount")} <span className={p.ussdAccent}>{formatCurrency(total)}</span></p>
                        <p>{t("checkout.from", { phone })}</p>
                        <p className="mt-2">{t("checkout.enterPin")}</p>
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
                            className={`w-full bg-[#16233b]/70 border border-[#D4AF37]/60 rounded px-3 py-2 text-[#E7C65B] text-center text-lg tracking-widest outline-none focus:border-[#E7C65B] placeholder:text-[#B8942E]`}
                            placeholder={t("checkout.pinPlaceholder")}
                            autoFocus
                          />
                        </div>
                        <div className="mt-3 text-center text-xs text-[#D4AF37]">
                          {ussdPin.length > 0 ? (
                            <span className="text-[#E7C65B]">{t("checkout.pressSend")}</span>
                          ) : (
                            t("checkout.enter4Pin")
                          )}
                        </div>
                        <button
                          type="submit"
                          disabled={ussdPin.length < 4}
                          className="mt-3 w-full rounded bg-blue-600 py-2 text-sm font-semibold text-white disabled:opacity-40 hover:bg-blue-700 transition-colors"
                        >
                          {t("checkout.send")}
                        </button>
                      </form>
                    </>
                  )}
                  {ussdStep === "processing" && (
                    <div className="flex flex-col items-center justify-center flex-1">
                      <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
                      <p className="text-[#D4AF37]">{t("checkout.processing")}</p>
                      <p className="mt-1 text-xs text-[#B8942E]">{t("checkout.wait")}</p>
                    </div>
                  )}
                  {ussdStep === "done" && (
                    <div className="flex flex-col items-center justify-center flex-1">
                      <div className="mb-2 text-2xl text-[#D4AF37]">&#10003;</div>
                      <p className="text-[#E7C65B]">{t("checkout.approved")}</p>
                      <p className="mt-1 text-xs text-[#B8942E]">{t("checkout.confirming")}</p>
                    </div>
                  )}
                  <div className="mt-auto border-t border-[#D4AF37]/40 pt-2 text-xs text-[#B8942E] text-center">
                    {p.footer}
                  </div>
                </div>
              </div>
            </div>
          )}

          {paymentState === "processing" && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFCC00]/20">
                <svg className="h-8 w-8 text-[#B8960E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm4-2v14m8-13h.01M11 12h2a1 1 0 110 2h-2a1 1 0 110-2z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{t("checkout.checkPhone")}</p>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {t("checkout.requestSent", { provider: p ? p.name : t("checkout.state.mobile"), phone })}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t("checkout.openPhone")}
              </p>
              <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                {t("checkout.waiting", { referenceId })}
              </p>
            </div>
          )}

          {paymentState === "success" && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#D4AF37]/15 text-[#B8942E]">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{t("checkout.paymentSuccess")}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("checkout.redirecting")}</p>
            </div>
          )}

          {paymentState === "failed" && (
            <div className="py-8 text-center">
              <p className="text-red-600">{t("checkout.notCompleted")}</p>
              <Button className="mt-4" onClick={() => setPaymentState("form")}>
                {t("checkout.tryAgain")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
