import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound, ShieldCheck } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Complete a password reset for your account.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account access"
      title="Complete your password reset"
      description="Password resets are completed with a verified one-time email code."
    >
      <div className="space-y-4">
        <div className="border border-border bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground">
          <p className="flex items-center gap-2 text-sm font-bold text-foreground">
            <KeyRound className="h-4 w-4 text-info" aria-hidden="true" />
            Start with your email
          </p>
          <p className="mt-1.5">
            Enter your account email on the forgot-password page, verify the
            6-digit code we send you, then choose a new password. You will be
            redirected to sign in as soon as the reset is complete.
          </p>
        </div>

        <div className="flex items-start gap-2 border border-info/25 bg-info-soft p-3 text-xs leading-relaxed text-info">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Codes expire after 10 minutes and can only be used once.
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/forgot-password">Start verified reset</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}
