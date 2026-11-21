import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function AdminFormPage({
  backHref,
  backLabel,
  eyebrow,
  title,
  description,
  badge,
  children,
}: {
  backHref: string;
  backLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
            <Link href={backHref}>
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              {backLabel}
            </Link>
          </Button>
          <Separator />
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="eyebrow text-muted-foreground">
                {eyebrow}
              </p>
              <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                {title}
              </h1>
              {badge ? <Badge tone="info">{badge}</Badge> : null}
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        </CardContent>
      </Card>

      {children}
    </div>
  );
}
