import type { Role } from "@/types";

/** Prevent open redirects by only allowing same-origin absolute paths. */
export function safeNextPath(next: string | null | undefined, fallback = "/"): string {
  if (!next) return fallback;
  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("\\")) {
    return fallback;
  }
  return trimmed;
}

export function roleHome(role: Role): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "/super-admin";
    case "ADMIN":
      return "/admin";
    case "CUSTOMER":
    default:
      return "/account";
  }
}
