"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this is where you would forward to an error reporter.
    console.error("Storefront error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[70dvh] items-center justify-center px-6 py-20">
      <div className="max-w-md text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary-500 dark:text-accent-300">
          Something interrupted
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          We couldn&apos;t finish that request.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          A temporary error occurred while loading this view. Try again — if it
          persists, the studio is one email away.
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            Reference: {error.digest}
          </p>
        ) : null}
        <Button onClick={reset} className="mt-7" size="lg">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
      </div>
    </main>
  );
}
