import { forwardRef, type ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: LucideIcon;
  label: string;
  tone?: "default" | "primary" | "accent" | "danger";
  size?: "sm" | "md" | "lg";
}

const tones = {
  default: "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-primary/40 hover:text-[var(--foreground)]",
  primary: "border-primary/20 bg-primary/10 text-primary hover:bg-primary/20",
  accent: "border-accent-foreground/20 bg-[var(--accent-soft)] text-[var(--accent-foreground)] hover:brightness-95",
  danger: "border-[var(--danger)]/25 bg-[var(--danger-soft)] text-[var(--danger)] hover:brightness-95",
} as const;

const sizes = {
  sm: "h-9 w-9 rounded-xl",
  md: "h-11 w-11 rounded-full",
  lg: "h-12 w-12 rounded-full",
} as const;

/** Accessible round icon control with a mandatory label and 44px default hit area. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { icon: Icon, label, tone = "default", size = "md", className, ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex shrink-0 items-center justify-center border text-sm font-semibold shadow-[var(--shadow-soft)] outline-none transition-[color,background-color,border-color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50",
          tones[tone],
          sizes[size],
          className,
        )}
        {...props}
      >
        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>
    );
  },
);
