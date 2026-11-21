import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthCallbackView } from "@/components/auth/auth-callback-view";
import { AuthShell } from "@/components/auth/auth-shell";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Completing sign-in",
  robots: { index: false, follow: false },
};

export default function AuthCallbackPage() {
  return (
    <AuthShell
      eyebrow="Google sign-in"
      title="One moment"
      description="We are finishing the secure hand-off from Google."
    >
      <Suspense fallback={<Skeleton className="h-48 w-full rounded-none" />}>
        <AuthCallbackView />
      </Suspense>
    </AuthShell>
  );
}
