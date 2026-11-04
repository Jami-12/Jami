import type { Metadata, Viewport } from "next";

import "./globals.css";

import { AppProviders } from "@/components/providers/app-providers";
import { THEME_SCRIPT } from "@/components/providers/theme-provider";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Aether — Objects for a considered life",
    template: "%s · Aether",
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "design objects",
    "premium audio",
    "wearables",
    "lighting",
    "workspace",
    "ecommerce",
    "Aether",
  ],
  authors: [{ name: "Aether Studio", url: SITE.url }],
  creator: "Aether Studio",
  publisher: "Aether Studio",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE.url,
    siteName: SITE.name,
    title: "Aether — Objects for a considered life",
    description: SITE.description,
    images: [
      {
        url: "/og.svg",
        width: 1200,
        height: 630,
        alt: "Aether — objects for a considered life",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aether — Objects for a considered life",
    description: SITE.description,
    images: ["/og.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  category: "shopping",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1320" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-dvh antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
