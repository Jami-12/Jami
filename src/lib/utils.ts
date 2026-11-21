import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { CURRENCY } from "./constants";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function currencySymbol(currency = CURRENCY): string {
  switch (currency.toUpperCase()) {
    case "BDT":
      return "৳";
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    default:
      return `${currency.toUpperCase()} `;
  }
}

export function formatCurrency(
  amount: number | string | null | undefined,
  options: { currency?: string; compact?: boolean; digits?: number } = {},
): string {
  const numeric = typeof amount === "string" ? Number(amount) : (amount ?? 0);
  const value = Number.isFinite(numeric) ? numeric : 0;
  const currency = options.currency ?? CURRENCY;
  const symbol = currencySymbol(currency);

  if (options.compact) {
    const compact = new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
    return `${symbol}${compact}`;
  }

  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: options.digits ?? (Number.isInteger(value) ? 0 : 2),
    maximumFractionDigits: options.digits ?? 2,
  });

  return `${symbol}${formatter.format(value)}`;
}

export function formatNumber(value: number | null | undefined): string {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

export function formatCompact(value: number | null | undefined): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value ?? 0);
}

export function formatPercent(value: number | null | undefined, digits = 1): string {
  return `${(value ?? 0).toFixed(digits)}%`;
}

export function formatDate(
  value: string | Date | null | undefined,
  style: "short" | "medium" | "long" = "medium",
): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  if (style === "short") {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  }

  if (style === "long") {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatMonth(year: number, month: number, style: "short" | "long" = "long"): string {
  const date = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat("en-US", {
    month: style,
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatRelative(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });
  const divisions: Array<[number, Intl.RelativeTimeFormatUnit]> = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.34524, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];

  let duration = seconds;
  for (const [amount, unit] of divisions) {
    if (Math.abs(duration) < amount) {
      return formatter.format(Math.round(duration), unit);
    }
    duration /= amount;
  }
  return formatter.format(Math.round(duration), "year");
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return "A";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function truncate(value: string, max = 120): string {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
}

export function discountPercent(price: number, compareAt?: number | null): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function absoluteUrl(path = "/"): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  try {
    return new URL(path, base).toString();
  } catch {
    return base;
  }
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!error) return fallback;

  if (typeof error === "object") {
    const candidate = error as {
      message?: unknown;
      response?: { data?: { message?: unknown; error?: unknown } };
    };

    const responseMessage = candidate.response?.data?.message;
    if (typeof responseMessage === "string" && responseMessage.trim()) {
      return responseMessage;
    }

    const responseError = candidate.response?.data?.error;
    if (typeof responseError === "string" && responseError.trim()) {
      return responseError;
    }

    if (typeof candidate.message === "string" && candidate.message.trim()) {
      return candidate.message;
    }
  }

  if (typeof error === "string" && error.trim()) return error;
  return fallback;
}

export function humanizeEnum(value: string | null | undefined): string {
  if (!value) return "—";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function buildQueryString(
  params: Record<string, string | number | boolean | null | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const OPTIMIZABLE_HOSTS = new Set([
 "images.unsplash.com",
 "res.cloudinary.com",
 "lh3.googleusercontent.com",
 "localhost",
 "127.0.0.1",
]);

export function canOptimizeImage(src: string | null | undefined): boolean {
  if (!src) return false;
  try {
    const url = new URL(src, SITE_FALLBACK);
    return OPTIMIZABLE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

const SITE_FALLBACK = "http://localhost:3000";
