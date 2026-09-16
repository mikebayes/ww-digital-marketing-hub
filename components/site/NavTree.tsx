"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { sections } from "@/lib/navigation";

/**
 * The Hub index, shared by the desktop rail and the mobile drawer.
 *
 * Four levels have to stay legible against each other on a charcoal surface:
 * section heading, published module, planned module, and status. They are
 * separated by weight, size and a teal edge marker rather than by fading
 * planned items out — a module nobody can read is no more useful than one
 * that is missing.
 */
export function NavTree({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const activeRef = useRef<HTMLAnchorElement>(null);

  /*
   * Reveal the current module if it is outside the scrolled rail. The index
   * already runs past a laptop viewport and will only get longer, so landing
   * on a page whose nav entry is off-screen is the common case, not the edge
   * case. `nearest` keeps it from jumping when the item is already visible.
   */
  useEffect(() => {
    const el = activeRef.current;
    if (!el) return;

    const scroller = el.closest<HTMLElement>(".overflow-y-auto");
    if (!scroller) return;

    const item = el.getBoundingClientRect();
    const view = scroller.getBoundingClientRect();
    if (item.top >= view.top && item.bottom <= view.bottom) return;

    el.scrollIntoView({ block: "nearest" });
  }, [pathname]);

  return (
    <nav aria-label="Hub" className="pb-8">
      {sections.map((section) => {
        const sectionHref = `/${section.slug}`;
        const sectionActive = pathname === sectionHref;
        const withinSection = pathname.startsWith(`${sectionHref}/`);

        return (
          <div
            key={section.slug}
            className="border-b border-white/[0.09] last:border-b-0"
          >
            <Link
              href={sectionHref}
              onClick={onNavigate}
              className={`group flex items-baseline gap-3 px-5 pt-6 ${
                /*
                 * A section with no entries has no list beneath it to carry
                 * the closing space, so the heading absorbs it and the rail
                 * keeps one rhythm.
                 */
                section.entries.length > 0 ? "pb-3.5" : "pb-8"
              }`}
            >
              <span
                aria-hidden
                className={`label tabular-nums transition-colors ${
                  sectionActive || withinSection
                    ? "text-teal"
                    : "text-white/35 group-hover:text-white/60"
                }`}
              >
                {section.marker}
              </span>
              <span
                className={`text-[0.9375rem] leading-tight font-semibold tracking-[-0.01em] transition-colors ${
                  sectionActive
                    ? "text-white"
                    : "text-white/85 group-hover:text-white"
                }`}
              >
                {section.title}
              </span>
            </Link>

            {section.entries.length > 0 && (
              <ul className="pb-5">
                {section.entries.map((entry) => {
                  const href = `${sectionHref}/${entry.slug}`;
                  const active = pathname === href;
                  const planned = entry.status === "planned";

                  return (
                    <li key={entry.slug}>
                      <Link
                        href={href}
                        ref={active ? activeRef : undefined}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={`group relative flex py-[0.4375rem] pr-4 pl-5 transition-colors ${
                          active ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"
                        }`}
                      >
                        {/* Active marker sits flush in the rail's left edge. */}
                        <span
                          aria-hidden
                          className={`absolute inset-y-0 left-0 w-[3px] transition-colors ${
                            active ? "bg-teal" : "bg-transparent"
                          }`}
                        />
                        <span className="text-[0.8125rem] leading-[1.45]">
                          <span
                            className={`transition-colors ${
                              active
                                ? "font-medium text-white"
                                : planned
                                  ? "text-white/55 group-hover:text-white/80"
                                  : "text-white/75 group-hover:text-white"
                            }`}
                          >
                            {entry.title}
                          </span>
                          {planned && (
                            <span className="label ml-2 align-[0.12em] text-[0.5625rem] whitespace-nowrap text-white/30">
                              Soon
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}
