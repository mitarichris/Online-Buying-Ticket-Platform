import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPayment, isXendlyConfigured, XendlyError } from "@/lib/xendly";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isXendlyConfigured()) {
    return NextResponse.json(
      { error: "Mobile money payments are not configured yet." },
      { status: 503 }
    );
  }

  let body: { orderId?: string; phoneNumber?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { orderId, phoneNumber } = body;
  if (!orderId || !phoneNumber) {
    return NextResponse.json(
      { error: "Order and phone number are required" },
      { status: 400 }
    );
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        total: true,
        status: true,
        paymentStatus: true,
        paymentIntentId: true,
      },
    });

    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "pending") {
      return NextResponse.json(
        { error: "This order can no longer be paid" },
        { status: 409 }
      );
    }

    const payment = await createPayment({
      amount: order.total,
      msisdn: phoneNumber,
      description: `TicketHub order ${order.id}`,
      reference: order.id,
      metadata: { order_id: order.id, user_id: session.user.id },
      idempotencyKey: order.id,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentIntentId: payment.id,
        paymentProvider: payment.network,
        paymentStatus: "pending",
      },
    });

    return NextResponse.json({
      paymentId: payment.id,
      status: payment.status,
      network: payment.network,
      reference: payment.id,
    });
  } catch (error: unknown) {
    if (error instanceof XendlyError) {
      const status = error.status >= 400 && error.status < 500 ? error.status : 502;
      return NextResponse.json({ error: error.message }, { status });
    }
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to initiate payment" },
      { status: 500 }
    );
  }
}
