import type { Metadata } from "next";

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

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to your store"
      description="Your orders, saved pieces and delivery details, exactly where you left them."
    >
      <LoginForm next={next} />
    </AuthShell>
  );
}
