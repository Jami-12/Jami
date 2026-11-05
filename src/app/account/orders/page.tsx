import type { Metadata } from "next";

import { OrdersList } from "@/components/account/orders-list";

export const metadata: Metadata = {
  title: "Your orders",
  robots: { index: false, follow: false },
};

export default function AccountOrdersPage() {
  return <OrdersList />;
}
