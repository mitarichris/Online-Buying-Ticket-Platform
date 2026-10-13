import crypto from "crypto";

const BASE_URL = process.env.XENDLY_BASE_URL || "https://api.xendlypay.com";
const API_KEY = process.env.XENDLY_API_KEY || "";
const WEBHOOK_SECRET = process.env.XENDLY_WEBHOOK_SECRET || "";

const TIMESTAMP_TOLERANCE_SECONDS = 300;

export type XendlyNetwork = "mtn" | "airtel" | "unknown";
export type XendlyStatus = "pending" | "succeeded" | "failed" | "cancelled";

export interface XendlyPayment {
  id: string;
  status: XendlyStatus;
  direction: "collect" | "payout";
  amount: number;
  fee: number;
  currency: string;
  msisdn: string;
  network: XendlyNetwork;
  reference: string | null;
  metadata: Record<string, unknown> | null;
  xendly_reference: string | null;
  failure_code: string | null;
  failure_message: string | null;
  created_at: string;
  completed_at: string | null;
}

interface XendlyEnvelope<T> {
  success: boolean;
  payload: T;
  timestamp: string;
}

export class XendlyError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "XendlyError";
    this.status = status;
  }
}

export function isXendlyConfigured(): boolean {
  return API_KEY.length > 0;
}

export function normalizeMsisdn(phone: string): string {
  const clean = phone.replace(/[^0-9]/g, "");
  if (clean.startsWith("250")) return clean;
  return `250${clean.replace(/^0/, "")}`;
}

async function xendlyRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!isXendlyConfigured()) {
    throw new XendlyError(503, "XendlyPay is not configured. Set XENDLY_API_KEY.");
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers || {}),
    },
  });

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      (data as { message?: string } | null)?.message ||
      `XendlyPay request failed with status ${res.status}`;
    throw new XendlyError(res.status, message);
  }

  return data as T;
}

export async function createPayment(params: {
  amount: number;
  msisdn: string;
  description?: string;
  reference: string;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
}): Promise<XendlyPayment> {
  const amount = Math.round(params.amount);
  if (amount < 100) {
    throw new XendlyError(400, "Amount must be at least 100 RWF.");
  }

  const res = await xendlyRequest<XendlyEnvelope<XendlyPayment>>("/v1/payments", {
    method: "POST",
    headers: params.idempotencyKey ? { "Idempotency-Key": params.idempotencyKey } : {},
    body: JSON.stringify({
      amount,
      currency: "RWF",
      msisdn: normalizeMsisdn(params.msisdn),
      description: params.description,
      reference: params.reference,
      metadata: params.metadata,
    }),
  });

  return res.payload;
}

export async function getPayment(id: string): Promise<XendlyPayment> {
  const res = await xendlyRequest<XendlyEnvelope<XendlyPayment>>(`/v1/payments/${id}`, {
    method: "GET",
  });
  return res.payload;
}

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string = WEBHOOK_SECRET
): boolean {
  if (!signatureHeader || !secret) return false;

  let timestamp = "";
  let signature = "";
  for (const part of signatureHeader.split(",")) {
    const [key, value] = part.split("=");
    if (key?.trim() === "t") timestamp = value?.trim() ?? "";
    if (key?.trim() === "v1") signature = value?.trim() ?? "";
  }
  if (!timestamp || !signature) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - ts) > TIMESTAMP_TOLERANCE_SECONDS) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  const provided = Buffer.from(signature, "utf8");
  const computed = Buffer.from(expected, "utf8");
  if (provided.length !== computed.length) return false;

  return crypto.timingSafeEqual(provided, computed);
}
