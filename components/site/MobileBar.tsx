"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { NavTree } from "./NavTree";
import { Wordmark } from "./Wordmark";
import { site } from "@/lib/site";
// TEMPORARY: SignOutButton is not rendered while Microsoft sign-in is
// dormant — there is no session to end. AccessControl stands in for it on
// /intakes only. See lib/auth/temporary-gate.ts.
import { AccessControl } from "./AccessControl";

/**
 * Below `lg` the rail becomes a charcoal bar with a full-height drawer. The
 * drawer carries the same index as the desktop rail rather than a reduced
 * version of it.
 */
export function MobileBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 bg-charcoal px-5 lg:hidden">
        {/*
         * Below 480px the lockup stands alone — there is not room for the
         * property name next to it and the Index button, and a truncated
         * "Digital …" is worse than nothing. The drawer and every page header
         * name the Hub anyway.
         */}
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Wordmark tone="light" height={26} />
          <span
            className="hidden h-5 w-px shrink-0 bg-white/20 min-[480px]:block"
            aria-hidden
          />
          <span className="hidden truncate text-[0.8125rem] leading-tight font-semibold tracking-[-0.01em] text-white/85 min-[480px]:block">
            {site.name}
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="hub-drawer"
          className="label flex items-center gap-2 border border-white/20 px-3 py-2 text-white/80 transition-colors hover:border-white/40 hover:text-white"
        >
          {open ? "Close" : "Index"}
          <span aria-hidden className="flex w-3.5 flex-col gap-[3px]">
            <span className="h-px w-full bg-current" />
            <span className="h-px w-full bg-current" />
            <span className="h-px w-full bg-current" />
          </span>
        </button>
      </header>

      {open && (
        <div
          id="hub-drawer"
          className="fixed inset-x-0 top-14 bottom-0 z-40 overflow-y-auto overscroll-contain bg-charcoal lg:hidden"
        >
          <NavTree onNavigate={() => setOpen(false)} />
          <div className="border-t border-white/[0.09] px-5 py-5">
            <AccessControl className="mb-3" />
            <p className="text-xs text-white/40">
              Version {site.version} · {site.updated}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
