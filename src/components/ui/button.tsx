import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
} from "react";

import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "destructive"
  | "subtle"
  | "link";

/** `default`, `icon-xs` and `icon-sm` are kept for newer shadcn registry parts. */
export type ButtonSize =
  | "sm"
  | "default"
  | "md"
  | "lg"
  | "icon"
  | "icon-xs"
  | "icon-sm"
  | "icon-lg";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none active:translate-y-px motion-reduce:active:translate-y-0";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-[var(--shadow-soft)] hover:bg-primary/90 hover:shadow-[var(--shadow-lift)]",
  default:
    "bg-primary text-primary-foreground shadow-[var(--shadow-soft)] hover:bg-primary/90",
  secondary:
    "bg-secondary text-secondary-foreground shadow-[var(--shadow-soft)] hover:bg-secondary/70",
  outline:
    "border border-[var(--border)] bg-[var(--card)]/80 text-[var(--foreground)] hover:border-primary/40 hover:bg-[var(--secondary)]",
  ghost:
    "bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]",
  danger:
    "bg-[var(--danger)] text-white shadow-[var(--shadow-soft)] hover:brightness-110",
  destructive:
    "bg-[var(--destructive)] text-[var(--destructive-foreground)] shadow-[var(--shadow-soft)] hover:brightness-110",
  subtle:
    "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--border)]",
  link: "rounded-none bg-transparent px-0 text-primary underline-offset-4 hover:underline",
};

const sizes: Record<ButtonSize, string> = {
  "icon-xs": "h-8 w-8 p-0",
  "icon-sm": "h-9 w-9 p-0",
  "icon-lg": "h-12 w-12 p-0",
  sm: "h-9 px-4 text-xs",
  default: "h-11 px-5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-sm sm:text-base",
  icon: "h-11 w-11 p-0",
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
  /** Render the single child element (for example a `Link`) with button styles. */
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    loading = false,
    asChild = false,
    children,
    disabled,
    type = "button",
    ...props
  },
  ref,
) {
  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement(child)) return null;

    const childElement = child as ReactElement<{ className?: string }>;
    return cloneElement(childElement, {
      className: cn(
        buttonVariants({ variant, size }),
        childElement.props.className,
        className,
      ),
    });
  }

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
