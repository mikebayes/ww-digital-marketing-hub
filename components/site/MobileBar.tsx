"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { NavTree } from "./NavTree";
import { Wordmark } from "./Wordmark";
import { site } from "@/lib/site";

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
      <header className="sticky top-0 z-40 flex items-center justify-between gap-4 bg-charcoal px-5 py-3.5 lg:hidden">
        <Link href="/" className="flex items-center gap-3">
          <Wordmark tone="light" height={20} />
          <span className="h-4 w-px bg-white/20" aria-hidden />
          <span className="text-xs leading-tight font-semibold tracking-tight text-white/80">
            Playbook
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="playbook-drawer"
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
          id="playbook-drawer"
          className="fixed inset-x-0 top-[57px] bottom-0 z-40 overflow-y-auto bg-charcoal lg:hidden"
        >
          <NavTree onNavigate={() => setOpen(false)} />
          <div className="border-t border-white/10 px-6 py-5">
            <p className="text-xs text-white/40">
              Version {site.version} · {site.updated}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
