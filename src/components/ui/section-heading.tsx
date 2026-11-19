import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <p className="eyebrow mb-2 text-[var(--color-primary-500)] dark:text-[var(--color-accent-300)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
