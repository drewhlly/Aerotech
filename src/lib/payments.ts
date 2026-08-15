import type { PaymentProvider } from "./aerotech";

export type CreateFundingRequest = {
  employerId: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  reference: string;
};

export type PaymentIntent = {
  id: string;
  provider: PaymentProvider;
  reference: string;
  amount: number;
  currency: string;
  status: "created" | "pending" | "successful" | "failed";
  checkoutUrl?: string;
};

export async function createPayrollFundingIntent(
  request: CreateFundingRequest
): Promise<PaymentIntent> {
  /*
   * FRONTEND / DEMO CONTRACT ONLY.
   *
   * Production implementation belongs in a secure server/API route:
   *
   * 1. Validate employer.
   * 2. Validate amount.
   * 3. Create provider payment intent.
   * 4. Store transaction in database.
   * 5. Return provider checkout URL.
   * 6. Verify webhook server-side.
   * 7. Credit wallet only after verified payment.
   *
   * Never expose provider secret keys in this file or any client component.
   */

  return {
    id: `DEMO-${Date.now()}`,
    provider: request.provider,
    reference: request.reference,
    amount: request.amount,
    currency: request.currency,
    status: "created",
  };
}
