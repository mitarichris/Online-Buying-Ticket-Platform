import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPayment, isXendlyConfigured, type XendlyStatus } from "@/lib/xendly";
import { confirmOrderPayment, failOrderPayment } from "@/lib/payments";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { userId: true, paymentStatus: true, paymentIntentId: true, paymentProvider: true },
  });

  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.paymentStatus === "successful") {
    return NextResponse.json({ status: "succeeded", network: order.paymentProvider });
  }
  if (order.paymentStatus === "failed" || order.paymentStatus === "cancelled") {
    return NextResponse.json({ status: order.paymentStatus, network: order.paymentProvider });
  }

  if (!order.paymentIntentId || !isXendlyConfigured()) {
    return NextResponse.json({ status: "pending", network: order.paymentProvider });
  }

  try {
    const payment = await getPayment(order.paymentIntentId);
    const status: XendlyStatus = payment.status;

    if (status === "succeeded") {
      await confirmOrderPayment(orderId, { provider: payment.network, paymentId: payment.id });
    } else if (status === "failed" || status === "cancelled") {
      await failOrderPayment(orderId, status);
    }

    return NextResponse.json({ status, network: payment.network });
  } catch {
    return NextResponse.json({ status: "pending", network: order.paymentProvider });
  }
}
