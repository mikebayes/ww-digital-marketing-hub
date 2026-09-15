"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sections } from "@/lib/navigation";

/**
 * The playbook index, shared by the desktop rail and the mobile drawer.
 * Rendered on a charcoal surface in both cases.
 */
export function NavTree({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Playbook" className="pb-10">
      <Link
        href="/"
        onClick={onNavigate}
        className={`label block border-b border-white/10 px-6 py-4 transition-colors ${
          pathname === "/"
            ? "text-teal"
            : "text-white/45 hover:text-white"
        }`}
      >
        Home
      </Link>

      {sections.map((section) => {
        const sectionHref = `/${section.slug}`;
        const sectionActive = pathname === sectionHref;
        const withinSection = pathname.startsWith(`${sectionHref}/`);

        return (
          <div key={section.slug} className="border-b border-white/10">
            <Link
              href={sectionHref}
              onClick={onNavigate}
              className="flex items-baseline gap-3 px-6 pt-5 pb-3 group"
            >
              <span
                className={`label tabular-nums transition-colors ${
                  sectionActive || withinSection
                    ? "text-teal"
                    : "text-white/30 group-hover:text-white/60"
                }`}
              >
                {section.marker}
              </span>
              <span
                className={`text-[0.9375rem] font-semibold tracking-tight transition-colors ${
                  sectionActive
                    ? "text-white"
                    : "text-white/75 group-hover:text-white"
                }`}
              >
                {section.title}
              </span>
            </Link>

            <ul className="pb-4">
              {section.entries.map((entry) => {
                const href = `${sectionHref}/${entry.slug}`;
                const active = pathname === href;

                return (
                  <li key={entry.slug}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={`relative flex items-center gap-2 py-1.5 pr-5 pl-6 text-[0.8125rem] leading-snug transition-colors ${
                        active
                          ? "text-white"
                          : entry.status === "planned"
                            ? "text-white/35 hover:text-white/70"
                            : "text-white/60 hover:text-white"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`h-px w-3 shrink-0 transition-colors ${
                          active ? "bg-teal" : "bg-white/20"
                        }`}
                      />
                      <span className="flex-1">{entry.title}</span>
                      {entry.status === "planned" && (
                        <span
                          className="label shrink-0 text-[0.5625rem] text-white/25"
                          title="Not yet written"
                        >
                          Soon
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
