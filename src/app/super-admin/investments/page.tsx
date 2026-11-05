import type { Metadata } from "next";

import { InvestmentsView } from "@/components/admin/investments-view";

export const metadata: Metadata = { title: "Investments" };

export default function SuperAdminInvestmentsPage() {
  return <InvestmentsView />;
}
