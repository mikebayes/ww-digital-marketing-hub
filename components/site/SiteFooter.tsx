import { Wordmark } from "./Wordmark";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-rule">
      <div className="flex flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between md:px-12 lg:px-16">
        <div className="flex items-center gap-4">
          <Wordmark height={25} />
          <span className="h-4 w-px bg-rule" aria-hidden />
          <span className="label text-muted">Internal use only</span>
        </div>
        <p className="text-xs text-muted">
          {site.name} · Version {site.version} · Updated {site.updated}
        </p>
      </div>
    </footer>
  );
}
