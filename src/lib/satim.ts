// src/lib/satim.ts
import { env } from "@/server/env";

export interface SatimPaymentParams {
  orderId: string;
  grossAmountDinar: number;
  returnUrl: string;
  failUrl: string;
}

export interface SatimInitResult {
  redirectUrl: string;
}

export interface SatimVerifyResult {
  success: boolean;
  transactionId?: string;
  errorCode?: string;
}

export async function initiateSatimPayment(params: SatimPaymentParams): Promise<SatimInitResult> {
  // TODO: In production, POST to SATIM API using SATIM_TERMINAL_ID, SATIM_MERCHANT_ID, SATIM_PASSWORD
  // Stub: redirect to dev callback
  const base = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return {
    redirectUrl: `${base}/api/payments/satim/dev-callback?orderId=${params.orderId}&success=true`,
  };
}

export async function verifySatimPayment(orderId: string): Promise<SatimVerifyResult> {
  // TODO: In production, call SATIM getOrderStatus endpoint
  // Stub: always succeeds in dev
  return { success: true, transactionId: `SATIM-DEV-${orderId}` };
}
