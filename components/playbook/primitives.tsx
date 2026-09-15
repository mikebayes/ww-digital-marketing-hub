import Link from "next/link";
import type { ReactNode } from "react";

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

/** The header block at the top of every playbook page. */
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

      <div className={breadcrumb ? "mt-8" : ""}>
        {marker && (
          <span
            aria-hidden
            className="mb-5 block font-display text-5xl leading-none font-semibold text-rule-strong tabular-nums"
          >
            {marker}
          </span>
        )}
        <h1 className="max-w-4xl text-3xl leading-[1.1] font-semibold tracking-[-0.02em] text-charcoal text-balance sm:text-4xl lg:text-[2.75rem]">
          {title}
        </h1>
        {lede && (
          <div className="mt-5 max-w-2xl text-base leading-relaxed text-slate sm:text-lg">
            {lede}
          </div>
        )}
      </div>

      {meta && meta.length > 0 && (
        <dl className="mt-9 grid grid-cols-2 gap-px border border-rule bg-rule sm:grid-cols-4">
          {meta.map((item) => (
            <div key={item.label} className="bg-surface px-4 py-3.5">
              <dt className="label text-muted">{item.label}</dt>
              <dd className="mt-1.5 text-[0.8125rem] leading-snug font-medium text-charcoal">
                {item.value}
              </dd>
            </div>
          ))}
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
    <section id={id} className="border-t border-rule pt-10 first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-1.5 @sm:flex-row @sm:gap-6">
        <span
          aria-hidden
          className="label shrink-0 pt-1.5 text-muted @sm:w-10"
        >
          {marker}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl leading-tight font-semibold tracking-[-0.015em] text-charcoal sm:text-2xl">
            {title}
          </h2>
          {intro && (
            <div className="prose-playbook mt-4 text-[0.9375rem]">{intro}</div>
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
      <div className="prose-playbook mt-3 text-[0.9375rem]">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Blocks                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * A numbered rule or principle. The defining content unit of the playbook —
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

/** Short aside. Teal for guidance, charcoal for something that must not be missed. */
export function Callout({
  label,
  tone = "teal",
  children,
}: {
  label: string;
  tone?: "teal" | "charcoal";
  children: ReactNode;
}) {
  if (tone === "charcoal") {
    return (
      <aside className="bg-charcoal px-6 py-5">
        <SectionLabel tone="light">{label}</SectionLabel>
        <div className="mt-2.5 max-w-2xl text-[0.9375rem] leading-relaxed text-white/75 [&_strong]:font-semibold [&_strong]:text-white">
          {children}
        </div>
      </aside>
    );
  }

  return (
    <aside className="border-l-2 border-teal bg-teal-tint px-6 py-5">
      <SectionLabel>{label}</SectionLabel>
      <div className="mt-2.5 max-w-2xl text-[0.9375rem] leading-relaxed text-slate [&_strong]:font-semibold [&_strong]:text-charcoal">
        {children}
      </div>
    </aside>
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

/** Card used on the homepage and section indexes to route into the playbook. */
export function RouteCard({
  href,
  marker,
  title,
  summary,
  count,
}: {
  href: string;
  marker?: string;
  title: string;
  summary: string;
  count?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col bg-surface px-6 py-6 transition-colors hover:bg-teal-tint"
    >
      <div className="flex items-baseline justify-between gap-4">
        {marker && (
          <span className="label text-teal-ink tabular-nums">{marker}</span>
        )}
        {count && <span className="label text-muted">{count}</span>}
      </div>
      <h3 className="mt-5 text-lg leading-snug font-semibold tracking-[-0.015em] text-charcoal">
        {title}
      </h3>
      <p className="mt-2.5 flex-1 text-[0.875rem] leading-relaxed text-slate">
        {summary}
      </p>
      <span
        aria-hidden
        className="mt-6 h-px w-8 bg-rule-strong transition-all duration-200 group-hover:w-14 group-hover:bg-teal"
      />
    </Link>
  );
}

/** Marks a page or module that has not been written yet. */
export function PlannedNotice({ children }: { children: ReactNode }) {
  return (
    <div className="border border-dashed border-rule-strong bg-surface px-6 py-7">
      <SectionLabel tone="muted">Not yet written</SectionLabel>
      <div className="prose-playbook mt-3 text-[0.9375rem]">{children}</div>
    </div>
  );
}
