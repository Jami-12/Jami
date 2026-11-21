import type { Metadata } from "next";

import { CashCollectionView } from "@/components/admin/cash-collection/cash-collection-view";

export const metadata: Metadata = {
  title: "Cash collection",
  robots: { index: false, follow: false },
};

export default function AdminCashCollectionPage() {
  return <CashCollectionView />;
}
