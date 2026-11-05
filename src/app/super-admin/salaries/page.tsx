import type { Metadata } from "next";

import { SalariesView } from "@/components/admin/salaries-view";

export const metadata: Metadata = { title: "Salaries" };

export default function SuperAdminSalariesPage() {
  return <SalariesView />;
}
