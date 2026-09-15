import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { SiteRail } from "@/components/site/SiteRail";
import { MobileBar } from "@/components/site/MobileBar";
import { SiteFooter } from "@/components/site/SiteFooter";
import { site } from "@/lib/site";
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
  icons: { icon: "/ww-mark.svg" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#1c1f23",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        <a
          href="#content"
          className="label sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-charcoal focus:px-4 focus:py-3 focus:text-white"
        >
          Skip to content
        </a>

        <SiteRail />
        <MobileBar />

        <div className="lg:pl-rail">
          {/* Capped so the measure does not run away on ultrawide displays. */}
          <div className="mx-auto max-w-[110rem]">
            <main id="content" className="min-h-[70vh]">
              {children}
            </main>
            <SiteFooter />
          </div>
        </div>
      </body>
    </html>
  );
}
