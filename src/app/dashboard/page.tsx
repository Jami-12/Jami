import type { Metadata } from "next";

import { DashboardRedirect } from "@/components/auth/dashboard-redirect";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <DashboardRedirect />;
}
