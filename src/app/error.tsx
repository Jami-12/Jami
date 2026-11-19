"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
    <main
      id="main"
      className="flex min-h-[70dvh] items-center justify-center px-4 py-16 sm:px-6"
    >
      <Card className="w-full max-w-lg overflow-hidden">
        <CardHeader className="items-start gap-4 border-b border-border pb-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="space-y-2">
            <Badge tone="accent" className="w-fit">
              Something interrupted
            </Badge>
            <CardTitle className="font-display text-2xl sm:text-3xl">
              We couldn&apos;t finish that request.
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              A temporary error occurred while loading this view. Try again — if
              it persists, the studio is one email away.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {error.digest ? (
            <p className="font-mono text-xs text-muted-foreground">
              Reference: {error.digest}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              No additional reference was provided for this error.
            </p>
          )}
        </CardContent>
        <Separator />
        <CardFooter className="flex flex-wrap gap-3 pt-5">
          <Button onClick={reset} size="sm">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/">Return home</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
