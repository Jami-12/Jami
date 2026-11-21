import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your account to track orders, wishlist and payments.",
  alternates: { canonical: "/login" },
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const raw = params.next;
  const next = Array.isArray(raw) ? raw[0] : raw;
  const rawReset = params.reset;
  const resetSuccess =
    (Array.isArray(rawReset) ? rawReset[0] : rawReset) === "success";

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to your store"
      description="Your orders, saved pieces and delivery details, exactly where you left them."
    >
      {resetSuccess ? (
        <div
          role="status"
          className="mb-5 flex items-start gap-2 border border-success/25 bg-success-soft p-3 text-xs leading-relaxed text-success"
        >
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Password reset complete. Sign in with your new password.
        </div>
      ) : null}
      <LoginForm next={next} />
    </AuthShell>
  );
}
