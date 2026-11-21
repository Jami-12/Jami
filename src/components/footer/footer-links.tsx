import Link from "next/link";

import { FOOTER_NAV } from "@/lib/constants";

export function FooterLinks() {
  return (
    <nav aria-label="Footer" className="grid min-w-0 gap-8 sm:grid-cols-3 lg:border-l lg:border-border lg:pl-12 xl:pl-20">
      {FOOTER_NAV.map((group) => (
        <div key={group.title}>
          <h3 className="border-b border-border pb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            {group.title}
          </h3>
          <ul className="mt-4 space-y-3">
            {group.links.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
