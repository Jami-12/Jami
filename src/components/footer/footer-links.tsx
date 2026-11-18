import Link from "next/link";

import { FOOTER_NAV } from "@/lib/constants";

export function FooterLinks() {
  return (
    <div className="grid gap-8 sm:grid-cols-3">
      {FOOTER_NAV.map((group) => (
        <div key={group.title}>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            {group.title}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {group.links.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
