"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth-store";
import type { Role } from "@/types";

export function RoleGuard({
  allowed,
  children,
}: {
  allowed: Role[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const hydrated = useAuthStore((state) => state.hydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  React.useEffect(() => {
    if (!hydrated) return;
    if (!accessToken || !user) {
      const next =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/";
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [hydrated, accessToken, user, router]);

  if (!hydrated) {
    return (
      <div className="container-page py-16">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-4 h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (!accessToken || !user) {
    return (
      <div className="container-page py-16 text-center">
        <p className="text-sm text-muted-foreground">Redirecting to sign in…</p>
      </div>
    );
  }

  if (!allowed.includes(user.role)) {
    const destination =
      user.role === "SUPER_ADMIN"
        ? "/super-admin"
        : user.role === "ADMIN"
          ? "/admin"
          : "/account";
    return (
      <div className="container-page py-16">
        <Card className="mx-auto max-w-md p-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            403 · Restricted
          </p>
          <h1 className="mt-2 text-xl font-extrabold">This area isn&apos;t available to your role</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You are signed in as {user.role.toLowerCase().replace("_", " ")}. Head
            to the dashboard that matches your account.
          </p>
          <Button asChild className="mt-5">
            <a href={destination}>Go to my dashboard</a>
          </Button>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
