"use client";

import { useEffect, useState } from "react";

export interface TocItem {
  id: string;
  marker: string;
  title: string;
}

/** Sticky in-page index for long modules. Hidden below `xl`. */
export function OnThisPage({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="On this page" className="sticky top-12">
      <p className="label border-b border-rule pb-3 text-muted">On this page</p>
      <ul className="mt-4 space-y-0.5">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "location" : undefined}
                className={`flex gap-2.5 py-1.5 text-[0.8125rem] leading-snug transition-colors ${
                  isActive
                    ? "text-charcoal"
                    : "text-muted hover:text-charcoal"
                }`}
              >
                <span
                  className={`label shrink-0 pt-0.5 ${
                    isActive ? "text-teal-ink" : "text-rule-strong"
                  }`}
                >
                  {item.marker}
                </span>
                <span>{item.title}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
