"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { roleHome } from "@/lib/auth-routing";
import { useAuthStore } from "@/stores/auth-store";

export function DashboardRedirect() {
  const router = useRouter();
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  React.useEffect(() => {
    if (!hydrated) return;
    if (!user || !accessToken) {
      router.replace("/login?next=%2Fdashboard");
      return;
    }
    router.replace(roleHome(user.role));
  }, [hydrated, user, accessToken, router]);

  return (
    <div className="container-page py-16">
      <Skeleton className="h-8 w-48 rounded-none border border-border" />
      <Skeleton className="mt-4 h-40 w-full rounded-none border border-border" />
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Taking you to your dashboard…
      </p>
    </div>
  );
}
