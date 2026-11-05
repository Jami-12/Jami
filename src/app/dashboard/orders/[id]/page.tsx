import type { Metadata } from "next";

import { PaymentReturnView } from "@/components/account/payment-return-view";

export const metadata: Metadata = {
  title: "Payment return",
  robots: { index: false, follow: false },
};

/**
 * Compatibility route for payment provider callbacks, which redirect to
 * `${CLIENT_URL}/dashboard/orders/:id?paymentStatus=...`.
 */
export default async function DashboardOrderCallbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paymentStatus?: string }>;
}) {
  const { id } = await params;
  const { paymentStatus } = await searchParams;
  return <PaymentReturnView orderId={id} paymentStatus={paymentStatus ?? null} />;
}
