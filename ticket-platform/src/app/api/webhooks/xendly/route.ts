import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/xendly";
import { confirmOrderPayment, failOrderPayment } from "@/lib/payments";

export const runtime = "nodejs";

interface XendlyWebhookData {
  id?: string;
  status?: string;
  network?: string;
  reference?: string | null;
  metadata?: { order_id?: string } | null;
}

interface XendlyWebhookBody {
  id?: string;
  type?: string;
  data?: XendlyWebhookData;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-xendly-signature");
  const eventHeader = request.headers.get("x-xendly-event");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: XendlyWebhookBody;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const type = body.type || eventHeader || "";

  if (type === "ping") {
    return NextResponse.json({ received: true });
  }

  const data = body.data ?? {};
  const orderId = data.metadata?.order_id || data.reference || null;

  try {
    if (orderId && type === "payment.succeeded") {
      await confirmOrderPayment(orderId, { provider: data.network, paymentId: data.id });
    } else if (orderId && (type === "payment.failed" || type === "payment.cancelled")) {
      await failOrderPayment(orderId, type === "payment.cancelled" ? "cancelled" : "failed");
    }
  } catch (error: unknown) {
    console.error("Xendly webhook processing error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
