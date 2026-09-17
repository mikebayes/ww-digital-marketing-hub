import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { site } from "@/lib/site";
import { favicons, brandColors } from "@/lib/brand";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} · ${site.owner}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  // Served from the official brand library rather than duplicated at the root.
  icons: {
    icon: [
      { url: favicons.ico, sizes: "any" },
      { url: favicons.png32, type: "image/png", sizes: "32x32" },
      { url: favicons.png16, type: "image/png", sizes: "16x16" },
    ],
    apple: favicons.appleTouch,
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: brandColors.dark,
};

/**
 * Document shell only.
 *
 * The internal rail, mobile bar and footer used to live here, which meant every
 * route in the application got them. The client questionnaire must not, so the
 * chrome moved down into app/(hub)/layout.tsx and this layout was left with the
 * things that genuinely are global: fonts, tokens and metadata. Route groups do
 * not appear in URLs, so nothing the Hub serves changed address.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
