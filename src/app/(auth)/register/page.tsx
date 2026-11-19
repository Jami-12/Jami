import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create an account for faster checkout, order tracking and saved pieces.",
  alternates: { canonical: "/register" },
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const raw = params.next;
  const next = Array.isArray(raw) ? raw[0] : raw;

  return (
    <AuthShell
      eyebrow="Join the studio"
      title="Create your account"
      description="One account for orders, addresses, wishlist and support — no marketing noise."
    >
      <RegisterForm next={next} />
    </AuthShell>
  );
}
