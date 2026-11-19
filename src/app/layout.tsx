import type { Metadata, Viewport } from "next";

import "./globals.css";

import { DynamicFavicon } from "@/components/layout/dynamic-favicon";
import { AppProviders } from "@/components/providers/app-providers";
import { THEME_SCRIPT } from "@/components/providers/theme-provider";
import { SITE } from "@/lib/constants";
import { getSiteSettings } from "@/services/catalog";
import { Fraunces, Jost } from "next/font/google";
import { cn } from "@/lib/utils";

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "modern commerce",
    "online store",
    "fashion",
    "lifestyle",
    "premium essentials",
    "ecommerce",
    SITE.name,
  ],
  authors: [{ name: `${SITE.name} Studio`, url: SITE.url }],
  creator: `${SITE.name} Studio`,
  publisher: `${SITE.name} Studio`,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [
      {
        url: "/og.svg",
        width: 1200,
        height: 630,
        alt: `${SITE.name} storefront`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: ["/og.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  category: "shopping",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const initialSettings = await getSiteSettings();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", jost.variable, fraunces.variable)}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-dvh antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <AppProviders initialSettings={initialSettings}>
          <DynamicFavicon />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
