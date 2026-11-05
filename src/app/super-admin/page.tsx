import type { Metadata } from "next";

import { SuperOverview } from "@/components/admin/super-overview";

export const metadata: Metadata = { title: "Super admin" };

export default function SuperAdminPage() {
  return <SuperOverview />;
}
