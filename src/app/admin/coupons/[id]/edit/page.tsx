import type { Metadata } from "next";

import { CouponForm } from "@/components/admin/coupons";

export const metadata: Metadata = { title: "Edit coupon" };

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CouponForm couponId={id} />;
}
