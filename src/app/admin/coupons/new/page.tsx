import type { Metadata } from "next";

import { CouponForm } from "@/components/admin/coupons";

export const metadata: Metadata = { title: "New coupon" };

export default function NewCouponPage() {
  return <CouponForm />;
}
