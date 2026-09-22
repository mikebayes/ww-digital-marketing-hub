import Link from "next/link";
import type { ReactNode } from "react";
import { getSection, getEntry } from "@/lib/navigation";

/* -------------------------------------------------------------------------- */
/* Labels and headers                                                          */
/* -------------------------------------------------------------------------- */

/** Small uppercase marker used above headings and on panels. */
export function SectionLabel({
  children,
  tone = "teal",
  className = "",
}: {
  children: ReactNode;
  tone?: "teal" | "muted" | "light";
  className?: string;
}) {
  const tones = {
    teal: "text-teal-ink",
    muted: "text-muted",
    light: "text-teal",
  } as const;

  return (
    <p className={`label ${tones[tone]} ${className}`}>{children}</p>
  );
}

export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="label flex flex-wrap items-center gap-2 text-muted">
      {items.map((item, index) => (
        <span
          key={item.label}
          /*
           * The trailing crumb repeats the H1 immediately below it, so it is
           * dropped on narrow screens where it would wrap onto its own line.
           */
          className={`items-center gap-2 ${
            index === items.length - 1 && items.length > 1
              ? "hidden sm:flex"
              : "flex"
          }`}
        >
          {index > 0 && (
            <span aria-hidden className="h-px w-3 bg-rule-strong" />
          )}
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-charcoal">
              {item.label}
            </Link>
          ) : (
            <span className="text-charcoal">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/**
 * Column spans for the last meta cell, written out because Tailwind only sees
 * class names it can read in the source.
 */
const META_SPAN: Record<number, string> = { 2: "col-span-2" };
const META_SPAN_SM: Record<number, string> = {
  2: "sm:col-span-2",
  3: "sm:col-span-3",
  4: "sm:col-span-4",
};

/** The header block at the top of every Hub page. */
export function PageHeader({
  marker,
  title,
  lede,
  meta,
  breadcrumb,
}: {
  marker?: string;
  title: string;
  lede?: ReactNode;
  /** Key/value pairs rendered as a hairline-separated strip. */
  meta?: { label: string; value: string }[];
  breadcrumb?: { label: string; href?: string }[];
}) {
  return (
    <header className="border-b border-rule pb-10">
      {breadcrumb && <Breadcrumb items={breadcrumb} />}

      <div className={breadcrumb ? "mt-9" : ""}>
        {marker && (
          <span
            aria-hidden
            className="mb-6 flex items-center gap-3.5"
          >
            <span className="h-px w-8 bg-teal" />
            <span className="label text-[0.75rem] tabular-nums text-teal-ink">
              {marker}
            </span>
          </span>
        )}
        <h1 className="max-w-4xl text-[2rem] leading-[1.06] font-semibold tracking-[-0.03em] text-balance text-charcoal sm:text-[2.5rem] lg:text-[3.25rem]">
          {title}
        </h1>
        {lede && (
          <div className="mt-6 max-w-2xl text-base leading-relaxed text-slate sm:text-lg">
            {lede}
          </div>
        )}
      </div>

      {meta && meta.length > 0 && (
        <dl className="mt-9 grid grid-cols-2 gap-px border border-rule bg-rule sm:grid-cols-4">
          {meta.map((item, index) => {
            /*
             * The grid's own background is the rule colour, so a final row
             * with cells left over reads as a grey void rather than as
             * spacing. The last item stretches to close it. A count that
             * divides evenly — which is every page so far — spans nothing.
             */
            const last = index === meta.length - 1;
            const fill = (cols: number) => {
              const remainder = meta.length % cols;
              return last && remainder !== 0 ? cols - remainder + 1 : 0;
            };

            return (
              <div
                key={item.label}
                className={`bg-surface px-4 py-3.5 ${
                  META_SPAN[fill(2)] ?? ""
                } ${META_SPAN_SM[fill(4)] ?? ""}`}
              >
                <dt className="label text-muted">{item.label}</dt>
                <dd className="mt-1.5 text-[0.8125rem] leading-snug font-medium text-charcoal">
                  {item.value}
                </dd>
              </div>
            );
          })}
        </dl>
      )}
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Content sections                                                            */
/* -------------------------------------------------------------------------- */

/** A numbered top-level section within a module. */
export function Section({
  id,
  marker,
  title,
  intro,
  children,
}: {
  id: string;
  marker: string;
  title: string;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section
      id={id}
      className="relative border-t-2 border-charcoal pt-9 first:border-t-2"
    >
      {/* Teal cap on the section rule — the transition marker used throughout. */}
      <span aria-hidden className="absolute -top-0.5 left-0 h-0.5 w-10 bg-teal" />

      <div className="flex flex-col gap-2 @sm:flex-row @sm:gap-6">
        <span
          aria-hidden
          className="label shrink-0 pt-1.5 tabular-nums text-teal-ink @sm:w-10"
        >
          {marker}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl leading-tight font-semibold tracking-[-0.025em] text-charcoal sm:text-[1.625rem]">
            {title}
          </h2>
          {intro && (
            <div className="prose-hub mt-4 text-[0.9375rem]">{intro}</div>
          )}
          {children && <div className="mt-7 space-y-7">{children}</div>}
        </div>
      </div>
    </section>
  );
}

/** A sub-heading inside a Section. */
export function Subsection({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <div>
      {eyebrow && <SectionLabel className="mb-2">{eyebrow}</SectionLabel>}
      <h3 className="text-base font-semibold tracking-[-0.01em] text-charcoal">
        {title}
      </h3>
      <div className="prose-hub mt-3 text-[0.9375rem]">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Blocks                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * A numbered rule or principle. The defining content unit of the Hub —
 * one statement, one explanation.
 */
export function RuleBlock({
  items,
}: {
  items: { title: string; body: ReactNode }[];
}) {
  return (
    <ol className="border-t border-rule">
      {items.map((item, index) => (
        <li
          key={item.title}
          className="flex flex-col gap-1.5 border-b border-rule py-5 @sm:flex-row @sm:gap-6"
        >
          <span
            aria-hidden
            className="label shrink-0 pt-1 text-teal-ink @sm:w-10"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[0.9375rem] font-semibold text-charcoal">
              {item.title}
            </p>
            <div className="mt-1.5 text-[0.9375rem] leading-relaxed text-slate">
              {item.body}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * Short aside — one pattern across the Hub.
 *
 * An outlined box with a tinted header band: it draws attention through
 * structure rather than colour, so several can sit on one page without the
 * page turning into stripes. The 8px radius softens the box just enough
 * without breaking the square, ruled system everything else is built on;
 * `overflow-hidden` clips the header fill to the top corners.
 *
 * There is deliberately no tone prop. Emphasis comes from what the callout
 * says and where it sits, not from a louder box.
 */
export function Callout({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    /*
     * [&_p]:max-w-none because a Callout placed inside a Subsection sits in a
     * prose-hub container, which caps paragraphs at 68ch. That cap reached the
     * label band and left it stopping short of the callout's own border. The
     * measure is set by the body wrapper below instead, so it holds wherever
     * the callout is placed.
     */
    <aside className="overflow-hidden rounded-lg border border-rule-strong bg-surface [&_p]:max-w-none">
      <p className="label border-b border-rule-strong bg-rule px-6 py-3 text-charcoal">
        {label}
      </p>
      <div className="max-w-2xl px-6 py-5 text-[0.9375rem] leading-relaxed text-slate [&_a]:text-teal-ink [&_a]:underline [&_a]:underline-offset-2 [&_p+p]:mt-3 [&_strong]:font-semibold [&_strong]:text-charcoal">
        {children}
      </div>
    </aside>
  );
}

/**
 * Two contrasting panels. Use the dark tone for the side that carries more
 * weight — the owner, the default, the thing that wins when they conflict.
 */
export function SplitPanels({
  panels,
}: {
  panels: {
    label: string;
    title: string;
    description?: string;
    items: string[];
    tone: "dark" | "light";
  }[];
}) {
  return (
    <div className="grid gap-px border border-rule bg-rule @xl:grid-cols-2">
      {panels.map((panel) => {
        const dark = panel.tone === "dark";
        return (
          <div
            key={panel.title}
            className={`flex flex-col px-7 py-7 ${
              dark ? "bg-charcoal" : "bg-surface"
            }`}
          >
            <SectionLabel tone={dark ? "light" : "teal"}>
              {panel.label}
            </SectionLabel>
            <h4
              className={`mt-3 text-xl leading-snug font-semibold tracking-[-0.015em] ${
                dark ? "text-white" : "text-charcoal"
              }`}
            >
              {panel.title}
            </h4>
            {panel.description && (
              <p
                className={`mt-3 text-[0.9375rem] leading-relaxed ${
                  dark ? "text-white/65" : "text-slate"
                }`}
              >
                {panel.description}
              </p>
            )}
            <ul
              className={`mt-6 space-y-2 border-t pt-5 ${
                dark ? "border-white/15" : "border-rule"
              }`}
            >
              {panel.items.map((item) => (
                <li
                  key={item}
                  className={`relative pl-5 text-[0.875rem] leading-snug ${
                    dark ? "text-white/70" : "text-slate"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`absolute top-[0.6875em] left-0 h-px w-2.5 ${
                      dark ? "bg-teal" : "bg-rule-strong"
                    }`}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/** A short list of conditions that must all be true. */
export function Checklist({
  caption,
  items,
}: {
  caption?: string;
  items: string[];
}) {
  return (
    <div>
      {caption && <SectionLabel className="mb-3">{caption}</SectionLabel>}
      <ul className="border-t border-rule">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-4 border-b border-rule py-3.5"
          >
            <span
              aria-hidden
              className="mt-[0.4375em] h-1.5 w-1.5 shrink-0 bg-teal"
            />
            <span className="text-[0.9375rem] leading-relaxed text-charcoal">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Two-column Do / Avoid comparison. */
export function DoAvoid({
  doItems,
  avoidItems,
}: {
  doItems: string[];
  avoidItems: string[];
}) {
  const columns = [
    { title: "Do", items: doItems, accent: true },
    { title: "Avoid", items: avoidItems, accent: false },
  ];

  return (
    <div className="grid gap-px border border-rule bg-rule @xl:grid-cols-2">
      {columns.map((column) => (
        <div key={column.title} className="bg-surface px-6 py-6">
          <p
            className={`label pb-3 ${
              column.accent
                ? "border-b-2 border-teal text-teal-ink"
                : "border-b-2 border-rule-strong text-muted"
            }`}
          >
            {column.title}
          </p>
          <ul className="mt-4 space-y-2.5">
            {column.items.map((item) => (
              <li
                key={item}
                className="relative pl-5 text-[0.9375rem] leading-relaxed text-slate"
              >
                <span
                  aria-hidden
                  className={`absolute top-[0.6875em] left-0 h-px w-2.5 ${
                    column.accent ? "bg-teal" : "bg-rule-strong"
                  }`}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/**
 * A worked example — a reference piece of work with a note on what it
 * demonstrates and what to carry forward.
 */
export function ExamplePanel({
  label,
  title,
  demonstrates,
  takeaway,
  children,
}: {
  label: string;
  title: string;
  /** What this piece of work shows. */
  demonstrates: string[];
  /** The instruction to carry into new work. */
  takeaway: string;
  /** Optional visual: a swatch strip, a diagram, a specimen. */
  children?: ReactNode;
}) {
  return (
    <article className="border border-rule bg-surface">
      <div className="border-b border-rule px-6 py-5">
        <SectionLabel>{label}</SectionLabel>
        <h4 className="mt-2 text-lg font-semibold tracking-[-0.01em] text-charcoal">
          {title}
        </h4>
      </div>

      {children && <div className="border-b border-rule">{children}</div>}

      <div className="grid gap-px bg-rule @xl:grid-cols-2">
        <div className="bg-surface px-6 py-5">
          <p className="label text-muted">What it demonstrates</p>
          <ul className="mt-3 space-y-2">
            {demonstrates.map((item) => (
              <li
                key={item}
                className="relative pl-5 text-[0.875rem] leading-relaxed text-slate"
              >
                <span
                  aria-hidden
                  className="absolute top-[0.6875em] left-0 h-px w-2.5 bg-rule-strong"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-surface px-6 py-5">
          <p className="label text-teal-ink">Carry forward</p>
          <p className="mt-3 text-[0.875rem] leading-relaxed text-slate">
            {takeaway}
          </p>
        </div>
      </div>
    </article>
  );
}

/** Hairline-separated definition table. Good for conventions and field lists. */
export function DefinitionTable({
  caption,
  rows,
}: {
  caption?: string;
  rows: { term: string; detail: ReactNode }[];
}) {
  return (
    <div>
      {caption && <SectionLabel className="mb-3">{caption}</SectionLabel>}
      <dl className="border-t border-rule">
        {rows.map((row) => (
          <div
            key={row.term}
            className="grid gap-1 border-b border-rule py-4 @md:grid-cols-[minmax(0,11rem)_1fr] @md:gap-6"
          >
            <dt className="text-[0.875rem] font-semibold text-charcoal">
              {row.term}
            </dt>
            <dd className="text-[0.9375rem] leading-relaxed text-slate">
              {row.detail}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * Links onward to related modules. Titles, summaries and status come from
 * `lib/navigation.ts`, so a module that is later published stops advertising
 * itself as unwritten without anyone editing the page that links to it.
 */
export function NextModules({
  targets,
}: {
  /** `{ section }` links a whole section; `{ section, entry }` links a module. */
  targets: { section: string; entry?: string }[];
}) {
  const rows = targets.flatMap((target) => {
    const section = getSection(target.section);
    if (!section) return [];

    if (!target.entry) {
      return [
        {
          href: `/${section.slug}`,
          title: section.title,
          summary: section.summary,
          planned: false,
        },
      ];
    }

    const found = getEntry(target.section, target.entry);
    if (!found) return [];
    return [
      {
        href: `/${section.slug}/${found.entry.slug}`,
        title: found.entry.title,
        summary: found.entry.summary,
        planned: found.entry.status === "planned",
      },
    ];
  });

  return (
    <ul className="border-t border-rule">
      {rows.map((row) => (
        <li key={row.href} className="border-b border-rule">
          <Link
            href={row.href}
            className="group grid gap-x-8 gap-y-1 py-4 @xl:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]"
          >
            <span className="flex items-baseline gap-3">
              <span className="text-[0.9375rem] font-semibold text-charcoal transition-colors group-hover:text-teal-ink">
                {row.title}
              </span>
              {row.planned && (
                <span className="label shrink-0 text-muted">Soon</span>
              )}
            </span>
            <span className="text-[0.875rem] leading-relaxed text-slate">
              {row.summary}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Marks a page or module that has not been written yet. */
export function PlannedNotice({ children }: { children: ReactNode }) {
  return (
    <div className="border border-dashed border-rule-strong bg-surface px-6 py-7">
      <SectionLabel tone="muted">Not yet written</SectionLabel>
      <div className="prose-hub mt-3 text-[0.9375rem]">{children}</div>
    </div>
  );
}
