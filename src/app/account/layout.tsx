import type { Metadata } from "next";

import { AccountLayout } from "@/components/dashboard/dashboard-layouts";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AccountRootLayout({ children }: { children: React.ReactNode }) {
  return <AccountLayout>{children}</AccountLayout>;
}
