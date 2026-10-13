"use client";

import { useState, useEffect, useCallback } from "react";
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

type PaymentState = "form" | "processing" | "success" | "failed";
type Provider = "mtn" | "airtel";

const PROVIDERS: Record<Provider, { name: string; bg: string; border: string; text: string }> = {
  mtn: { name: "MTN MoMo", bg: "bg-[#FFCC00]", border: "border-[#FFCC00]", text: "text-[#000000]" },
  airtel: { name: "Airtel Money", bg: "bg-[#ED1C24]", border: "border-[#ED1C24]", text: "text-white" },
};

const NETWORK_LABELS: Record<string, string> = {
  mtn: "MTN MoMo",
  airtel: "Airtel Money",
};

function detectNetwork(phone: string): Provider | null {
  const clean = phone.replace(/[^0-9]/g, "").replace(/^250/, "").replace(/^0/, "");
  if (clean.startsWith("78") || clean.startsWith("79")) return "mtn";
  if (clean.startsWith("72") || clean.startsWith("73")) return "airtel";
  return null;
}

export default function CheckoutPage() {
  const { status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const { items, getTotal, clearCart } = useCartStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentState, setPaymentState] = useState<PaymentState>("form");
  const [loading, setLoading] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [network, setNetwork] = useState("");
  const [provider, setProvider] = useState<Provider | null>(null);

  const total = getTotal();

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error(t("checkout.signinToCheckout"));
      router.push("/login");
    }
  }, [status, router, t]);

  const pollPaymentStatus = useCallback(
    async (refId: string) => {
      const maxAttempts = 30;
      let attempts = 0;

      const poll = async () => {
        attempts++;
        try {
          const res = await fetch(`/api/payments/${refId}`);
          if (res.ok) {
            const { status: txnStatus } = await res.json();

            if (txnStatus === "succeeded") {
              setPaymentState("success");
              clearCart();
              toast.success(t("checkout.paySuccess"));
              setTimeout(() => router.push("/orders"), 800);
              return;
            }

            if (txnStatus === "failed" || txnStatus === "cancelled") {
              setPaymentState("failed");
              toast.error(t("checkout.payFailed"));
              return;
            }
          }
        } catch {
          // continue polling
        }

        if (attempts < maxAttempts) {
          setTimeout(poll, 3000);
        } else {
          setPaymentState("failed");
          toast.error(t("checkout.payTimedOut"));
        }
      };

      setTimeout(poll, 1000);
    },
    [clearCart, router, t]
  );

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!provider) {
      toast.error(t("checkout.selectMethod"));
      return;
    }
    const detectedNow = detectNetwork(phone);
    if (detectedNow && detectedNow !== provider) {
      toast.error(t("checkout.networkMismatch", { detected: PROVIDERS[detectedNow].name }));
      return;
    }
    setLoading(true);

    try {
      const orderPayload = {
        name,
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
        const err = await orderRes.json().catch(() => null);
        throw new Error(err?.error || t("checkout.somethingWentWrong"));
      }

      const order = await orderRes.json();

      const payRes = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, phoneNumber: phone }),
      });

      if (!payRes.ok) {
        const err = await payRes.json().catch(() => null);
        throw new Error(err?.error || t("checkout.somethingWentWrong"));
      }

      const data = await payRes.json();
      setReferenceId(data.paymentId);
      setNetwork(data.network || "");
      setPaymentState("processing");
      pollPaymentStatus(order.id);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("checkout.somethingWentWrong"));
      setPaymentState("failed");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return <div className="mx-auto max-w-2xl px-4 py-8" />;
  }

  if (items.length === 0 && paymentState === "form") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("checkout.empty")}</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{t("checkout.cartEmpty")}</p>
        <Link href="/events"><Button className="mt-4">{t("checkout.browse")}</Button></Link>
      </div>
    );
  }

  const detected = detectNetwork(phone);
  const detectedName = detected ? PROVIDERS[detected].name : "";
  const mismatch = !!provider && !!detected && detected !== provider;
  const networkLabel = NETWORK_LABELS[network] || (provider ? PROVIDERS[provider].name : t("checkout.state.mobile"));

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
                        className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all ${
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
              {mismatch && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {t("checkout.networkMismatch", { detected: detectedName })}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("checkout.sent", { provider: provider ? PROVIDERS[provider].name : t("checkout.state.mobile") })}
              </p>
              <Button type="submit" loading={loading} disabled={mismatch} size="lg" className="w-full">
                {t("checkout.pay", { amount: formatCurrency(total), provider: provider ? PROVIDERS[provider].name : t("checkout.state.mobile") })}
              </Button>
            </form>
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
                {t("checkout.requestSent", { provider: networkLabel, phone })}
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
