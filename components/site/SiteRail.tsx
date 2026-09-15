import Link from "next/link";
import { NavTree } from "./NavTree";
import { Wordmark } from "./Wordmark";
import { site } from "@/lib/site";

/** Fixed left rail. Desktop only — the mobile drawer renders the same NavTree. */
export function SiteRail() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-rail flex-col overflow-y-auto bg-charcoal lg:flex">
      <Link
        href="/"
        className="block border-b border-white/10 px-6 pt-7 pb-6"
      >
        <Wordmark tone="light" height={26} />
        <span className="mt-3 block text-[0.9375rem] leading-snug font-semibold tracking-tight text-white">
          {site.name}
        </span>
      </Link>

      <NavTree />

      <div className="mt-auto border-t border-white/10 px-6 py-5">
        <p className="label text-white/30">Internal</p>
        <p className="mt-2 text-xs leading-relaxed text-white/45">
          Version {site.version} · {site.updated}
        </p>
      </div>
    </aside>
  );
}
