import type { Metadata } from "next";

import { PaymentReturnView } from "@/components/account/payment-return-view";

export const metadata: Metadata = {
  title: "Payment return",
  robots: { index: false, follow: false },
};

/**
 * Compatibility route for payment provider callbacks, which redirect to
 * `${CLIENT_URL}/dashboard/orders/:id?paymentStatus=...`.
 *
 * Stripe returns here with `payment_intent` and `redirect_status` instead, so
 * those params are passed through for server-side reconciliation.
 */
export default async function DashboardOrderCallbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    paymentStatus?: string;
    payment_intent?: string;
    redirect_status?: string;
  }>;
}) {
  const { id } = await params;
  const { paymentStatus, payment_intent: paymentIntent, redirect_status: redirectStatus } =
    await searchParams;

  return (
    <PaymentReturnView
      orderId={id}
      paymentStatus={paymentStatus ?? null}
      paymentIntent={paymentIntent ?? null}
      redirectStatus={redirectStatus ?? null}
    />
  );
}
