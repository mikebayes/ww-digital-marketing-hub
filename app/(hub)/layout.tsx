import { SiteRail } from "@/components/site/SiteRail";
import { MobileBar } from "@/components/site/MobileBar";
import { SiteFooter } from "@/components/site/SiteFooter";

/**
 * The internal Hub shell — everything that used to sit in the root layout.
 *
 * Applies to the documentation pages and to Intakes, and to nothing else. The
 * client questionnaire renders outside this group and therefore never sees the
 * rail, the module index or the footer.
 */
export default function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
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
    </>
  );
}
