import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The application register.
 *
 * The Hub holds two kinds of screen. The documentation pages are read, so they
 * are built from measure, numbered sections and horizontal rules. This module
 * is operated, so it is built from tables, tabs and compact state — a person
 * on this screen is looking for one row and one control, not reading a page.
 *
 * Same tokens either way. Web Wizards teal, charcoal text, real borders, no
 * shadows and no gradients: an admin screen in the Hub should look like the
 * Hub, not like a dashboard someone bought.
 */

/* -------------------------------------------------------------------------- */
/* Page furniture                                                             */
/* -------------------------------------------------------------------------- */

/**
 * The top of an admin screen.
 *
 * No marker, no lede, no breadcrumb trail down the page. The eyebrow carries
 * the context a breadcrumb would, in one line, because this header sits above
 * a toolbar and tabs that need the vertical space more than prose does.
 */
export function AdminHeader({
  eyebrow,
  eyebrowHref,
  title,
  subtitle,
  status,
  actions,
}: {
  eyebrow?: string;
  eyebrowHref?: string;
  title: string;
  subtitle?: ReactNode;
  status?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="border-b border-rule pb-6">
      {eyebrow &&
        (eyebrowHref ? (
          <Link
            href={eyebrowHref}
            className="label inline-flex items-center gap-2 text-muted transition-colors hover:text-teal-ink"
          >
            <span aria-hidden>&larr;</span>
            {eyebrow}
          </Link>
        ) : (
          <p className="label text-muted">{eyebrow}</p>
        ))}

      <div className="mt-3 flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h1 className="text-[1.75rem] leading-tight font-semibold tracking-[-0.025em] text-charcoal">
              {title}
            </h1>
            {status}
          </div>
          {subtitle && (
            <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-slate">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-3">{actions}</div>
        )}
      </div>
    </header>
  );
}

/** The frame every admin screen sits in. Wider than a documentation page. */
export function AdminPage({ children }: { children: ReactNode }) {
  return (
    <div className="px-6 pt-10 pb-16 md:px-10 lg:px-12 lg:pt-12">{children}</div>
  );
}

/* -------------------------------------------------------------------------- */
/* State                                                                      */
/* -------------------------------------------------------------------------- */

export type PillTone = "neutral" | "teal" | "warn" | "quiet" | "live";

const PILL_TONES: Record<PillTone, string> = {
  neutral: "border-rule-strong bg-neutral-tint text-charcoal",
  teal: "border-teal bg-teal-tint text-teal-ink",
  // Amber rather than red: an outstanding question is work to do, not a fault.
  warn: "border-[#E0B84C] bg-[#FDF6E6] text-[#7A5B10]",
  quiet: "border-rule bg-surface text-muted",
  live: "border-charcoal bg-charcoal text-white",
};

/**
 * Compact state. A bordered pill rather than a coloured dot, because these
 * appear in table cells where a dot needs a legend and a word does not.
 */
export function Pill({
  tone = "neutral",
  children,
}: {
  tone?: PillTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`label inline-flex items-center whitespace-nowrap border px-2 py-1 ${PILL_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

/** Metadata beside a question. Quieter than a Pill, and never boxed. */
export function Meta({ children }: { children: ReactNode }) {
  return (
    <span className="label whitespace-nowrap text-muted">{children}</span>
  );
}

/* -------------------------------------------------------------------------- */
/* Tables                                                                     */
/* -------------------------------------------------------------------------- */

export function AdminTable({
  columns,
  children,
  minWidth = "58rem",
}: {
  columns: { label: string; width?: string; align?: "right" }[];
  children: ReactNode;
  minWidth?: string;
}) {
  return (
    <div className="overflow-x-auto border border-rule bg-surface">
      <table
        className="w-full table-fixed border-collapse text-left"
        style={{ minWidth }}
      >
        <colgroup>
          {columns.map((column, index) => (
            <col key={index} style={column.width ? { width: column.width } : undefined} />
          ))}
        </colgroup>
        <thead>
          <tr className="border-b border-rule-strong bg-neutral-tint">
            {columns.map((column) => (
              <th
                key={column.label}
                scope="col"
                className={`px-4 py-3 align-bottom ${
                  column.align === "right" ? "text-right" : ""
                }`}
              >
                <span className="label text-muted">{column.label}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/**
 * A clickable row.
 *
 * The whole row is a hit target, but the link itself is the client name rather
 * than an onClick on the <tr>: a row that navigates only via JavaScript cannot
 * be middle-clicked, cannot be copied, and does not tell a screen reader where
 * it goes.
 */
export function RowLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-[0.9375rem] font-semibold text-charcoal underline-offset-4 hover:text-teal-ink hover:underline"
    >
      {children}
    </Link>
  );
}

export const cellClass = "px-4 py-3.5 align-middle text-[0.875rem] text-slate";
export const rowClass =
  "border-b border-rule last:border-b-0 transition-colors hover:bg-paper";

/* -------------------------------------------------------------------------- */
/* Panels                                                                     */
/* -------------------------------------------------------------------------- */

/** A bordered block with a heading bar. The admin equivalent of a section. */
export function Panel({
  title,
  action,
  children,
  padded = true,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  padded?: boolean;
}) {
  return (
    <section className="border border-rule bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule bg-neutral-tint px-5 py-3">
        <h2 className="label text-charcoal">{title}</h2>
        {action}
      </div>
      <div className={padded ? "px-5 py-5" : ""}>{children}</div>
    </section>
  );
}

/** Label-over-value, the unit the Overview tab is built from. */
export function Detail({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="label text-muted">{label}</dt>
      <dd className="mt-1.5 text-[0.9375rem] leading-snug text-charcoal">
        {children}
      </dd>
    </div>
  );
}

export function DetailGrid({ children }: { children: ReactNode }) {
  return (
    <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </dl>
  );
}

/** A single number with its name. Restrained — no giant decorative metrics. */
export function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: ReactNode;
  tone?: "warn";
}) {
  return (
    <div className="border-r border-rule px-5 py-4 last:border-r-0">
      <p className="label text-muted">{label}</p>
      <p
        className={`mt-1.5 text-[1.375rem] leading-none font-semibold tabular-nums ${
          tone === "warn" ? "text-[#7A5B10]" : "text-charcoal"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function StatRow({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 border border-rule bg-surface sm:grid-cols-3 lg:grid-cols-5">
      {children}
    </div>
  );
}

/** Nothing here yet, said as a sentence. */
export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="px-5 py-8 text-center text-[0.9375rem] text-slate">
      {children}
    </p>
  );
}
