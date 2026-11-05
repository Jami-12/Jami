import type { Metadata } from "next";

import { TransactionsView } from "@/components/admin/transactions-view";

export const metadata: Metadata = { title: "Transactions" };

export default function SuperAdminTransactionsPage() {
  return <TransactionsView />;
}
