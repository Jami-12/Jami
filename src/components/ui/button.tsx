import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "subtle"
  | "link";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] whitespace-nowrap";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary-700)] text-white shadow-[0_10px_28px_-14px_rgba(44,69,97,0.7)] hover:bg-[var(--color-primary-800)] active:translate-y-px dark:bg-[var(--color-accent-300)] dark:text-[#082f49] dark:hover:bg-[var(--color-accent-200)]",
  secondary:
    "bg-[var(--color-accent-300)] text-[#082f49] shadow-[0_10px_28px_-14px_rgba(125,211,252,0.8)] hover:bg-[var(--color-accent-200)] active:translate-y-px",
  outline:
    "border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:border-[var(--color-primary-400)] hover:bg-[var(--muted)]",
  ghost:
    "bg-transparent text-[var(--foreground)] hover:bg-[var(--muted)]",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:translate-y-px dark:bg-red-500 dark:hover:bg-red-600",
  subtle:
    "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--border)]",
  link: "bg-transparent text-[var(--color-primary-600)] underline-offset-4 hover:underline dark:text-[var(--color-accent-300)] rounded-none px-0",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-sm sm:text-base",
  icon: "h-10 w-10 p-0",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", loading = false, children, disabled, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonVariants({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </button>
  );
});
