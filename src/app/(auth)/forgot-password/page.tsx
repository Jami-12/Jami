import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Request help resetting the password for your Aether account.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account access"
      title="Reset your password"
      description="Tell us which account needs help and we will guide you through a secure reset."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
