import { NextResponse } from "next/server";
import { getTransactionStatus } from "@/lib/mtn";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ referenceId: string }> }
) {
  const { referenceId } = await params;

  try {
    const status = await getTransactionStatus(referenceId);
    return NextResponse.json({ status });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to check status" },
      { status: 500 }
    );
  }
}
