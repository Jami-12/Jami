import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

/** Page-level heading shared by admin management screens. */
export function AdminListHeader({
  eyebrow,
  title,
  description,
  badge,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  badge?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 space-y-1.5">
        <p className="text-[11px] font-bold uppercase not-italic tracking-[0.22em] text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="font-display text-2xl font-semibold not-italic tracking-tight sm:text-3xl">{title}</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {badge ? (
          <Badge tone="neutral" className="whitespace-nowrap">
            {badge}
          </Badge>
        ) : null}
        {actions}
      </div>
    </div>
  );
}
