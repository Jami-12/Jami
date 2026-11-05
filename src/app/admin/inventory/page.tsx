import type { Metadata } from "next";

import { InventoryAdmin } from "@/components/admin/inventory-admin";

export const metadata: Metadata = { title: "Inventory" };

export default function AdminInventoryPage() {
  return <InventoryAdmin />;
}
