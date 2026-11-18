import type { Metadata, Viewport } from "next";

import "./globals.css";

import { AppProviders } from "@/components/providers/app-providers";
import { THEME_SCRIPT } from "@/components/providers/theme-provider";
import { SITE } from "@/lib/constants";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Aether — Modern wardrobe, considered",
    template: "%s · Aether",
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "luxury fashion",
    "designer clothing",
    "modern wardrobe",
    "editorial fashion",
    "premium essentials",
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
    title: "Aether — Modern wardrobe, considered",
    description: SITE.description,
    images: [
      {
        url: "/og.svg",
        width: 1200,
        height: 630,
        alt: "Aether — pieces for a considered wardrobe",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aether — Modern wardrobe, considered",
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
    { media: "(prefers-color-scheme: light)", color: "#F8F6F0" },
    { media: "(prefers-color-scheme: dark)", color: "#0F1B24" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..700&family=Jost:ital,wght@0,300..700;1,300..600&display=swap"
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
