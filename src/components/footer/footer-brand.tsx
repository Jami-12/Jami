import { AtSign, Mail, MapPin, Phone, Play, Send } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { SITE } from "@/lib/constants";

const SOCIAL_LINKS = [
  { href: SITE.social.instagram, label: "Instagram", Icon: AtSign },
  { href: SITE.social.x, label: "X", Icon: Send },
  { href: SITE.social.youtube, label: "YouTube", Icon: Play },
] as const;

export function FooterBrand() {
  return (
    <div className="min-w-0">
      <Brand
        wordmarkClassName="[&>span:last-child]:hidden"
        className="[&>span:first-child]:border-foreground [&>span:first-child]:bg-none [&>span:first-child]:bg-foreground [&>span:first-child]:text-background [&>span:first-child>span]:text-background group-hover:[&>span:first-child]:rotate-0 dark:[&>span:first-child]:border-foreground dark:[&>span:first-child]:bg-foreground dark:[&>span:first-child]:text-background dark:[&>span:first-child>span]:text-background"
      />

      <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
        <li>
          <a
            href={`mailto:${SITE.email}`}
            className="inline-flex items-center gap-2.5 transition hover:text-foreground"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-border bg-card">
              <Mail className="h-4 w-4" aria-hidden="true" />
            </span>
            {SITE.email}
          </a>
        </li>
        <li>
          <a
            href={`tel:${SITE.phone.replace(/\s+/g, "")}`}
            className="inline-flex items-center gap-2.5 transition hover:text-foreground"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-border bg-card">
              <Phone className="h-4 w-4" aria-hidden="true" />
            </span>
            {SITE.phone}
          </a>
        </li>
        <li className="inline-flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-border bg-card">
            <MapPin className="h-4 w-4" aria-hidden="true" />
          </span>
          {SITE.address}
        </li>
      </ul>

      <div className="mt-8 flex items-center gap-2">
        {SOCIAL_LINKS.map(({ href, label, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={`${SITE.name} on ${label}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-none border border-border bg-card text-muted-foreground transition hover:bg-foreground hover:text-background"
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </a>
        ))}
      </div>
    </div>
  );
}
