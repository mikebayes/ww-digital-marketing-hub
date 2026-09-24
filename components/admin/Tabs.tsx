"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * The tab strip on a questionnaire.
 *
 * Real links to real routes rather than client-side panels, so each tab is
 * bookmarkable, back works, and a page that loads a lot of rows only loads
 * them when someone asks for that tab.
 *
 * Horizontally scrollable below about 720px instead of wrapping into two rows
 * or collapsing into a select: a wrapped strip moves the page content down
 * every time the viewport changes, and a select hides where you are.
 */
export interface TabItem {
  href: string;
  label: string;
  /** Shown after the label, e.g. an outstanding count. */
  badge?: number;
}

export function Tabs({ items }: { items: TabItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Questionnaire"
      className="-mx-6 overflow-x-auto border-b border-rule px-6 md:-mx-10 md:px-10 lg:-mx-12 lg:px-12"
    >
      <ul className="flex min-w-max gap-1">
        {items.map((item) => {
          /*
           * The first tab is the questionnaire root, so it would prefix-match
           * every other tab. It is compared exactly; the rest allow a deeper
           * path beneath them.
           */
          const active =
            pathname === item.href ||
            (item.href !== items[0]?.href && pathname.startsWith(`${item.href}/`));

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-2 px-4 py-3 text-[0.9375rem] transition-colors ${
                  active
                    ? "font-semibold text-charcoal"
                    : "text-slate hover:text-charcoal"
                }`}
              >
                {item.label}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="label rounded-full bg-[#FDF6E6] px-1.5 py-0.5 text-[#7A5B10] tabular-nums">
                    {item.badge}
                  </span>
                )}
                <span
                  aria-hidden
                  className={`absolute inset-x-0 -bottom-px h-[2px] transition-colors ${
                    active ? "bg-teal" : "bg-transparent"
                  }`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
