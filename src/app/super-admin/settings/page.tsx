import type { Metadata } from "next";

import { SuperAdminSettings } from "@/components/admin/settings";
import { RoleGuard } from "@/components/auth/role-guard";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default function SuperAdminSettingsPage() {
  return (
    <RoleGuard allowed={["SUPER_ADMIN"]}>
      <SuperAdminSettings />
    </RoleGuard>
  );
}
