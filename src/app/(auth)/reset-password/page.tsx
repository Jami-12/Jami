import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound, Mail } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Complete a password reset for your Aether account.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account access"
      title="Complete your password reset"
      description="Reset links are issued manually after support verifies account ownership."
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground">
          <p className="flex items-center gap-2 text-sm font-bold text-foreground">
            <KeyRound className="h-4 w-4 text-primary-500 dark:text-accent-300" aria-hidden="true" />
            No reset token found
          </p>
          <p className="mt-1.5">
            This store does not expose an automated password-reset endpoint, so
            there is nothing to submit on this page. Support will send you a
            verified one-time link or help you change the password after signing
            in.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/forgot-password">Request a reset</Link>
          </Button>
          <Button asChild variant="outline">
            <a href={`mailto:${SITE.email}`}>
              <Mail className="h-4 w-4" aria-hidden="true" />
              Email support
            </a>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Already signed in?{" "}
          <Link href="/account/security" className="font-semibold text-primary-600 hover:underline dark:text-accent-300">
            Change your password from account security
          </Link>
          .
        </p>
      </div>
    </AuthShell>
  );
}
