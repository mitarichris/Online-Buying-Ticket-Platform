const FLW_BASE = process.env.FLW_BASE_URL || "https://api.flutterwave.com/v3";
const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
const FLW_PUBLIC_KEY = process.env.FLW_PUBLIC_KEY;

export const isConfigured = !!(FLW_PUBLIC_KEY && FLW_SECRET_KEY);

export interface FlutterwavePaymentRequest {
  amount: number;
  currency: string;
  tx_ref: string;
  phone_number: string;
  email: string;
  fullname: string;
}

export interface FlutterwavePaymentResponse {
  status: string;
  message: string;
  data?: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    status: string;
    amount: number;
    charged_amount: number;
    app_fee: number;
    processor_response: string;
    currency: string;
    payment_type: string;
    meta: any;
  };
}

export async function initiateCharge(
  payment: FlutterwavePaymentRequest
): Promise<{ transactionId: number; txRef: string }> {
  if (!FLW_SECRET_KEY) {
    throw new Error(
      "Flutterwave not configured. Sign up at https://dashboard.flutterwave.com and set FLW_PUBLIC_KEY and FLW_SECRET_KEY in .env"
    );
  }

  const payload: Record<string, any> = {
    tx_ref: payment.tx_ref,
    amount: payment.amount,
    currency: payment.currency,
    phone_number: payment.phone_number,
    email: payment.email,
    fullname: payment.fullname,
  };

  const res = await fetch(`${FLW_BASE}/charges?type=mobile_money_rwanda`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FLW_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const response: FlutterwavePaymentResponse = await res.json();

  if (response.status !== "success") {
    throw new Error(
      `Flutterwave charge failed: ${response.message || JSON.stringify(response)}`
    );
  }

  if (!response.data) {
    throw new Error("Flutterwave returned no data");
  }

  return { transactionId: response.data.id, txRef: payment.tx_ref };
}

export async function verifyTransaction(
  txRef: string
): Promise<{ status: string; chargedAmount: number }> {
  if (!FLW_SECRET_KEY) {
    throw new Error("Flutterwave not configured");
  }

  const res = await fetch(
    `${FLW_BASE}/transactions/verify_by_reference?tx_ref=${txRef}`,
    {
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`,
      },
    }
  );

  const response: FlutterwavePaymentResponse & { data: any } = await res.json();

  if (response.status !== "success") {
    throw new Error(
      `Flutterwave verification failed: ${response.message || JSON.stringify(response)}`
    );
  }

  return {
    status: response.data?.status || "unknown",
    chargedAmount: response.data?.charged_amount || 0,
  };
}
