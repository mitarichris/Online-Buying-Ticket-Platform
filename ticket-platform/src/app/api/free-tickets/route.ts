import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getFreeTicketBalance } from "@/lib/free-tickets";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const balance = await getFreeTicketBalance(session.user.id);
  return NextResponse.json(balance);
}
