import type { Metadata } from "next";

import { SecurityForm } from "@/components/account/security-form";

export const metadata: Metadata = {
  title: "Security",
  robots: { index: false, follow: false },
};

export default function AccountSecurityPage() {
  return <SecurityForm />;
}
