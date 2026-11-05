import type { Metadata } from "next";

import { DiscountsView } from "@/components/admin/discounts-view";

export const metadata: Metadata = { title: "Discounts" };

export default function SuperAdminDiscountsPage() {
  return <DiscountsView />;
}
