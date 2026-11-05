import type { Metadata } from "next";

import { ExpensesAdmin } from "@/components/admin/expenses-admin";

export const metadata: Metadata = { title: "Expenses" };

export default function AdminExpensesPage() {
  return <ExpensesAdmin />;
}
