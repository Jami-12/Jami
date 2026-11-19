"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { useSiteSettings } from "@/components/providers/site-settings-provider";
import { SITE } from "@/lib/constants";

const FALLBACK_ICON = "/icon.svg";

/**
 * Keeps the browser tab (title + icons) in sync with the store name and logo
 * saved in Super Admin Settings. Next.js metadata is static, so this small
 * client bridge rewrites the live document head as soon as settings load or
 * change — navigation is handled too via `usePathname`.
 */
export function DynamicFavicon() {
  const { settings } = useSiteSettings();
  const pathname = usePathname();
  const appliedName = useRef<string>(SITE.name);

  const name = settings.siteName?.trim() || SITE.name;
  const icon = settings.navbarLogoUrl?.trim() || FALLBACK_ICON;

  // Tab title — preserve per-page metadata by swapping only the store name.
  useEffect(() => {
    const previous = appliedName.current;
    const current = document.title;

    if (current.includes(previous)) {
      document.title = current.split(previous).join(name);
    } else if (!current.includes(name)) {
      document.title = `${name} — ${SITE.tagline}`;
    }

    appliedName.current = name;
  }, [name, pathname]);

  // Favicon / touch icon — the uploaded store logo becomes the tab icon.
  useEffect(() => {
    const selectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
    ];

    let found = false;
    for (const selector of selectors) {
      document.querySelectorAll<HTMLLinkElement>(selector).forEach((link) => {
        found = true;
        link.setAttribute("href", icon);
      });
    }

    if (!found) {
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = icon;
      document.head.appendChild(link);
    }
  }, [icon]);

  // Social / PWA identity follows the runtime store name.
  useEffect(() => {
    const setMeta = (attribute: "name" | "property", key: string, content: string) => {
      let element = document.querySelector<HTMLMetaElement>(
        `meta[${attribute}="${key}"]`,
      );
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    setMeta("property", "og:site_name", name);
    setMeta("property", "og:title", document.title);
    setMeta("name", "application-name", name);
  }, [name, pathname]);

  return null;
}
