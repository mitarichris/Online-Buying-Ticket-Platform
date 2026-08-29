import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.INTOUCH_BASE_URL || "https://www.intouchpay.co.rw/api";
const USERNAME = process.env.INTOUCH_USERNAME || "testa";
const ACCOUNT_NO = process.env.INTOUCH_ACCOUNT_NO || "250160000011";
const PARTNER_PASSWORD = process.env.INTOUCH_PARTNER_PASSWORD || "pass123456789";
const CALLBACK_HOST = process.env.CALLBACK_HOST || "http://localhost:3000";

const transactionStatuses = new Map<string, string>();
export const isSandboxMode = process.env.INTOUCH_SANDBOX === "true";
export const isRealConfig = !isSandboxMode && !!(process.env.INTOUCH_USERNAME && process.env.INTOUCH_ACCOUNT_NO && process.env.INTOUCH_PARTNER_PASSWORD);

export async function setTransactionStatus(ref: string, status: string) {
  transactionStatuses.set(ref, status);

  if (status === "successful") {
    const order = await prisma.order.findUnique({
      where: { id: ref },
      select: { userId: true, status: true, items: true },
    }).catch(() => null);

    if (order && order.status !== "confirmed") {
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.ticketType.update({
            where: { id: item.ticketTypeId },
            data: { available: { decrement: item.quantity } },
          });
        }

        await tx.order.update({
          where: { id: ref },
          data: { paymentStatus: "successful", status: "confirmed" },
        });
      }).catch(() => {});

      if (order.userId) {
        await prisma.notification.create({
          data: {
            userId: order.userId,
            title: "Payment Successful",
            message: "Your payment was successful. Your tickets are ready in My Orders.",
          },
        }).catch(() => {});
      }
    }
  } else if (status === "failed") {
    await prisma.order.updateMany({
      where: { id: ref, status: "pending" },
      data: { paymentStatus: "failed", status: "cancelled" },
    }).catch(() => {});
  } else {
    await prisma.order.updateMany({
      where: { id: ref },
      data: { paymentStatus: status },
    }).catch(() => {});
  }
}

export async function getTransactionStatus(ref: string): Promise<string | undefined> {
  const cached = transactionStatuses.get(ref);
  if (cached) {
    return cached;
  }

  const order = await prisma.order.findUnique({
    where: { id: ref },
    select: { paymentStatus: true },
  });

  if (order?.paymentStatus) {
    transactionStatuses.set(ref, order.paymentStatus);
    return order.paymentStatus;
  }

  return undefined;
}

function generatePassword(timestamp: number): string {
  const input = `${USERNAME}${ACCOUNT_NO}${PARTNER_PASSWORD}${timestamp}`;
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function formatPhone(phone: string): string {
  const clean = phone.replace(/[^0-9]/g, "");
  return clean.startsWith("250") ? clean : `250${clean.replace(/^0/, "")}`;
}

export async function requestPayment(
  amount: number,
  phone: string,
  transactionId: string
): Promise<{ success: boolean; transactionId: string; simulation: boolean }> {
  if (!isRealConfig) {
    await setTransactionStatus(transactionId, "pending");
    return { success: true, transactionId, simulation: true };
  }

  const timestamp = Math.round(Date.now() / 1000);
  const password = generatePassword(timestamp);

  const body = {
    username: USERNAME,
    timestamp: String(timestamp),
    amount: String(amount),
    password,
    mobilephone: phone,
    requesttransactionid: transactionId,
    callbackurl: `${CALLBACK_HOST}/api/webhooks/intouch`,
  };

  const res = await fetch(`${BASE_URL}/requestpayment/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!data.success) {
    await setTransactionStatus(transactionId, "pending");
    return { success: true, transactionId, simulation: true };
  }

  return { success: true, transactionId: data.requesttransactionid || transactionId, simulation: false };
}
