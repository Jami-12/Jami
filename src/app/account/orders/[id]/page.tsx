import type { Metadata } from "next";

import { OrderDetailView } from "@/components/account/order-detail";

export const metadata: Metadata = {
  title: "Order details",
  robots: { index: false, follow: false },
};

export default async function AccountOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paymentStatus?: string }>;
}) {
  const { id } = await params;
  const { paymentStatus } = await searchParams;
  return <OrderDetailView orderId={id} paymentStatusParam={paymentStatus ?? null} />;
}
