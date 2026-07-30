import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requestToPay } from "@/lib/mtn";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { amount, phoneNumber, orderId } = await request.json();

    if (!amount || !phoneNumber || !orderId) {
      return NextResponse.json(
        { error: "Missing required fields: amount, phoneNumber, orderId" },
        { status: 400 }
      );
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
  } catch (error: any) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: error.message || "Payment failed" },
      { status: 500 }
    );
  }
}
