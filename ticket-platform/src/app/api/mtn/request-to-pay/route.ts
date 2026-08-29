import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requestToPay } from "@/lib/mtn";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { amount, phoneNumber, orderId, provider } = await request.json();

    if (!amount || !phoneNumber || !orderId) {
      return NextResponse.json(
        { error: "Missing required fields: amount, phoneNumber, orderId" },
        { status: 400 }
      );
    }

    if (provider && (provider === "mtn" || provider === "airtel")) {
      await prisma.order.updateMany({
        where: { id: orderId, userId: session.user.id },
        data: { paymentProvider: provider },
      }).catch(() => {});
    }

    const result = await requestToPay({
      amount,
      currency: "RWF",
      externalId: orderId,
      payerPhone: phoneNumber,
      payerMessage: "Ticket purchase",
      payeeNote: `Payment for order ${orderId}`,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment failed" },
      { status: 500 }
    );
  }
}
