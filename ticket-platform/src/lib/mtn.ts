import { requestPayment, formatPhone } from "./intouch";
import { getTransactionStatus as getInternalStatus, setTransactionStatus } from "./intouch";

export interface MtnPaymentRequest {
  amount: number;
  currency: string;
  externalId: string;
  payerPhone: string;
  payerMessage: string;
  payeeNote: string;
}

export interface MtnPaymentResponse {
  referenceId: string;
  status: string;
  simulation?: boolean;
}

export async function requestToPay(
  payment: MtnPaymentRequest
): Promise<MtnPaymentResponse> {
  const formattedPhone = formatPhone(payment.payerPhone);
  const result = await requestPayment(
    payment.amount,
    formattedPhone,
    payment.externalId
  );

  return {
    referenceId: result.transactionId,
    status: "pending",
    simulation: result.simulation,
  };
}

export async function getTransactionStatus(
  referenceId: string
): Promise<string> {
  const status = getInternalStatus(referenceId);
  if (!status) return "PENDING";
  return status === "successful" ? "SUCCESSFUL" : "FAILED";
}

export { setTransactionStatus };
