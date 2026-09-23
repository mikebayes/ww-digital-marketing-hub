"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavTree } from "./NavTree";
import { Wordmark } from "./Wordmark";
import { site } from "@/lib/site";
import { SignOutButton } from "./SignOutButton";

/**
 * Fixed left rail. Desktop only — the mobile drawer renders the same NavTree.
 *
 * The header establishes ownership before anything else: the official Web
 * Wizards lockup at a size where it reads as the company mark rather than as
 * decoration, then the property name beneath it.
 */
export function SiteRail() {
  const pathname = usePathname();
  const onHome = pathname === "/";

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-rail flex-col overflow-y-auto overscroll-contain bg-charcoal lg:flex">
      <div className="border-b border-white/[0.09] px-5 pt-8 pb-7">
        <Link href="/" className="block" aria-current={onHome ? "page" : undefined}>
          <Wordmark tone="light" height={38} />

          <span className="mt-5 flex items-center gap-2.5">
            <span
              aria-hidden
              className={`h-3.5 w-[3px] shrink-0 transition-colors ${
                onHome ? "bg-teal" : "bg-white/20"
              }`}
            />
            <span
              className={`text-[1.0625rem] leading-tight font-semibold tracking-[-0.02em] transition-colors ${
                onHome ? "text-white" : "text-white/80 hover:text-white"
              }`}
            >
              {site.name}
            </span>
          </span>
        </Link>
      </div>

      <NavTree />

      <div className="mt-auto border-t border-white/[0.09] px-5 py-5">
        <p className="label text-white/35">Internal</p>
        <p className="mt-2 text-xs leading-relaxed text-white/50">
          Version {site.version} · {site.updated}
        </p>
        <div className="mt-3">
          <SignOutButton />
        </div>
      </div>
    </aside>
  );
}
