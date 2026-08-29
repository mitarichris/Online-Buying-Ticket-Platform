import { NextResponse } from "next/server";
import { setTransactionStatus } from "@/lib/intouch";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { requesttransactionid, status } = body;

    if (requesttransactionid && status) {
      await setTransactionStatus(requesttransactionid, status);
    }

    return NextResponse.json({ message: "success", success: true });
  } catch {
    return NextResponse.json({ message: "success", success: true });
  }
}
