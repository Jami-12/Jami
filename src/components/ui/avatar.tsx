import { cn, getInitials } from "@/lib/utils";

const SIZES = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-9 w-9 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
} as const;

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        "bg-gradient-to-br from-primary-600 via-primary-700 to-accent-500",
        "font-bold text-white ring-2 ring-[var(--card)] shadow-[var(--shadow-soft)]",
        SIZES[size],
        className,
      )}
    >
      <span aria-hidden="true" className="select-none">
        {getInitials(name)}
      </span>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            (event.currentTarget as HTMLElement).style.display = "none";
          }}
        />
      ) : null}
    </span>
  );
}
