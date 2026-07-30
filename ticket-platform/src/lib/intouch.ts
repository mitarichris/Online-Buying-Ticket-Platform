import crypto from "crypto";

const BASE_URL = process.env.INTOUCH_BASE_URL || "https://www.intouchpay.co.rw/api";
const USERNAME = process.env.INTOUCH_USERNAME || "testa";
const ACCOUNT_NO = process.env.INTOUCH_ACCOUNT_NO || "250160000011";
const PARTNER_PASSWORD = process.env.INTOUCH_PARTNER_PASSWORD || "pass123456789";
const CALLBACK_HOST = process.env.CALLBACK_HOST || "http://localhost:3000";

const transactionStatuses = new Map<string, string>();
export const isRealConfig = !!(process.env.INTOUCH_USERNAME && process.env.INTOUCH_ACCOUNT_NO && process.env.INTOUCH_PARTNER_PASSWORD);

export function setTransactionStatus(ref: string, status: string) {
  transactionStatuses.set(ref, status);
}

export function getTransactionStatus(ref: string): string | undefined {
  return transactionStatuses.get(ref);
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
    setTransactionStatus(transactionId, "pending");
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
    setTransactionStatus(transactionId, "pending");
    return { success: true, transactionId, simulation: true };
  }

  return { success: true, transactionId: data.requesttransactionid || transactionId, simulation: false };
}
