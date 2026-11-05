import type { Metadata } from "next";

import { AccountingView } from "@/components/admin/accounting-view";

export const metadata: Metadata = { title: "Accounting" };

export default function SuperAdminAccountingPage() {
  return <AccountingView />;
}
