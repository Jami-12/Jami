import type { Metadata } from "next";

import { AuditView } from "@/components/admin/audit-view";

export const metadata: Metadata = { title: "Audit logs" };

export default function SuperAdminAuditPage() {
  return <AuditView />;
}
