import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function PageSection({
  title,
  description,
  actions,
  children,
  className,
  footer,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Optional pinned area, typically pagination or a summary row. */
  footer?: ReactNode;
}) {
  const hasHeader = Boolean(title || description || actions);

  return (
    <Card className={cn("min-w-0 overflow-hidden bg-card transition-colors hover:border-foreground", className)}>
      {hasHeader ? (
        <CardHeader className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0 space-y-1">
            {title ? (
              <CardTitle className="font-display text-base not-italic leading-tight">
                {title}
              </CardTitle>
            ) : null}
            {description ? (
              <CardDescription className="text-xs leading-relaxed">
                {description}
              </CardDescription>
            ) : null}
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </CardHeader>
      ) : null}

      <CardContent className="min-w-0 p-4 sm:p-5">{children}</CardContent>

      {footer ? (
        <>
          <Separator />
          <CardFooter className="flex-col items-stretch gap-0 p-4 sm:p-5">
            {footer}
          </CardFooter>
        </>
      ) : null}
    </Card>
  );
}
