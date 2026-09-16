import { SectionLabel } from "./primitives";

/* -------------------------------------------------------------------------- */
/* Colour                                                                      */
/* -------------------------------------------------------------------------- */

export interface Swatch {
  name: string;
  hex: string;
  role: string;
  /** Text colour to use on top of the swatch. */
  on: "light" | "dark";
}

export function SwatchGrid({
  caption,
  swatches,
}: {
  caption: string;
  swatches: Swatch[];
}) {
  return (
    <div>
      <SectionLabel tone="muted" className="mb-3">
        {caption}
      </SectionLabel>
      <div className="grid gap-px border border-rule bg-rule @md:grid-cols-2 @2xl:grid-cols-3">
        {swatches.map((swatch) => (
          <div key={swatch.hex} className="bg-surface">
            <div
              className="flex h-20 items-end p-3"
              style={{ backgroundColor: swatch.hex }}
            >
              <span
                className="label tabular-nums"
                style={{
                  color: swatch.on === "dark" ? "#ffffff" : "#1c1f23",
                  opacity: 0.85,
                }}
              >
                {swatch.hex.toUpperCase()}
              </span>
            </div>
            <div className="px-4 py-3.5">
              <p className="text-[0.875rem] font-semibold text-charcoal">
                {swatch.name}
              </p>
              <p className="mt-1 text-[0.8125rem] leading-snug text-muted">
                {swatch.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Typography                                                                  */
/* -------------------------------------------------------------------------- */

export function TypeSpecimen({
  typefaces,
}: {
  typefaces: {
    name: string;
    role: string;
    sample: string;
    notes: string;
    display?: boolean;
  }[];
}) {
  return (
    <div className="grid gap-px border border-rule bg-rule @xl:grid-cols-2">
      {typefaces.map((face) => (
        <div key={face.name} className="bg-surface px-6 py-6">
          <div className="flex items-baseline justify-between gap-3 border-b border-rule pb-3">
            <p className="text-[0.875rem] font-semibold text-charcoal">
              {face.name}
            </p>
            <SectionLabel tone="muted">{face.role}</SectionLabel>
          </div>
          <p
            className={`mt-5 text-[2.75rem] leading-none tracking-[-0.02em] text-charcoal ${
              face.display ? "font-display font-semibold" : "font-semibold"
            }`}
          >
            {face.sample}
          </p>
          <p className="mt-5 text-[0.875rem] leading-relaxed text-slate">
            {face.notes}
          </p>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Branding and ownership                                                      */
/* -------------------------------------------------------------------------- */

export interface OwnershipCategory {
  marker: string;
  title: string;
  branding: string;
  rationale: string;
  examples: string[];
  /** Relative visual weight: Web Wizards vs client, out of 100. */
  weight: { ww: number; client: number };
}

/**
 * The three-category branding decision framework, shown as a comparison with a
 * visual weighting bar rather than prose alone.
 */
export function OwnershipMatrix({
  categories,
}: {
  categories: OwnershipCategory[];
}) {
  return (
    /*
     * Subgrid keeps the four bands (title, branding, why, examples) aligned
     * across all three columns — without it, a title that wraps to three lines
     * pushes that column's rows out of step and the comparison stops reading
     * as a comparison.
     */
    <div className="grid gap-px border border-rule bg-rule @2xl:grid-cols-3 @2xl:grid-rows-[auto_auto_auto_1fr]">
      {categories.map((category) => (
        <div
          key={category.title}
          className="flex flex-col bg-surface @2xl:row-span-4 @2xl:grid @2xl:grid-rows-subgrid @2xl:gap-0"
        >
          <div className="border-b border-rule px-6 py-5">
            <SectionLabel>{category.marker}</SectionLabel>
            <h4 className="mt-2.5 text-base leading-snug font-semibold tracking-[-0.01em] text-charcoal">
              {category.title}
            </h4>
          </div>

          <div className="border-b border-rule px-6 py-5">
            <p className="label text-muted">Branding</p>
            <p className="mt-2 text-[0.9375rem] leading-snug font-semibold text-teal-ink">
              {category.branding}
            </p>

            <div className="mt-4">
              <div
                className="flex h-1.5 w-full overflow-hidden bg-rule"
                role="img"
                aria-label={`Relative prominence: Web Wizards ${category.weight.ww} percent, client ${category.weight.client} percent`}
              >
                <span
                  className="bg-teal"
                  style={{ width: `${category.weight.ww}%` }}
                />
                <span
                  className="bg-charcoal"
                  style={{ width: `${category.weight.client}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between">
                <span className="label text-teal-ink">Web Wizards</span>
                <span className="label text-muted">Client</span>
              </div>
            </div>
          </div>

          <div className="border-b border-rule px-6 py-5">
            <p className="label text-muted">Why</p>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-slate">
              {category.rationale}
            </p>
          </div>

          <div className="px-6 py-5">
            <p className="label text-muted">Typically</p>
            <ul className="mt-3 space-y-1.5">
              {category.examples.map((example) => (
                <li
                  key={example}
                  className="relative pl-5 text-[0.875rem] leading-snug text-slate"
                >
                  <span
                    aria-hidden
                    className="absolute top-[0.6875em] left-0 h-px w-2.5 bg-rule-strong"
                  />
                  {example}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Document anatomy                                                            */
/* -------------------------------------------------------------------------- */

/** A labelled diagram of the required parts of a Web Wizards document. */
export function DocumentAnatomy({
  parts,
}: {
  parts: { zone: string; requirement: string; detail: string }[];
}) {
  return (
    <div className="grid gap-8 @2xl:grid-cols-[minmax(0,15rem)_1fr] @2xl:gap-10">
      {/* Schematic page */}
      <div className="border border-rule bg-surface p-5">
        <div className="flex aspect-[8.5/11] flex-col bg-neutral-tint p-4">
          <div className="border-b border-rule-strong pb-3">
            <span className="block h-1 w-10 bg-teal" />
            <span className="mt-2.5 block h-2 w-3/4 bg-charcoal" />
            <span className="mt-1.5 block h-2 w-1/2 bg-rule-strong" />
          </div>

          <div className="mt-3 flex gap-1.5">
            <span className="h-1 w-8 bg-teal/60" />
            <span className="h-1 w-10 bg-rule-strong" />
          </div>

          <div className="mt-5 flex-1 space-y-3">
            {[0, 1, 2].map((block) => (
              <div key={block} className="space-y-1.5">
                <span className="block h-1.5 w-1/3 bg-charcoal/70" />
                <span className="block h-1 w-full bg-rule-strong" />
                <span className="block h-1 w-full bg-rule-strong" />
                <span className="block h-1 w-4/5 bg-rule-strong" />
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-rule-strong pt-2.5">
            <span className="h-1 w-14 bg-rule-strong" />
            <span className="h-1 w-5 bg-rule-strong" />
          </div>
        </div>
        <p className="mt-4 text-center text-[0.75rem] text-muted">
          Schematic only — proportions, not a template
        </p>
      </div>

      <dl className="border-t border-rule">
        {parts.map((part) => (
          <div
            key={part.zone}
            className="grid gap-1 border-b border-rule py-4 @md:grid-cols-[minmax(0,8rem)_1fr] @md:gap-6"
          >
            <dt className="label pt-1 text-teal-ink">{part.zone}</dt>
            <dd>
              <p className="text-[0.9375rem] font-semibold text-charcoal">
                {part.requirement}
              </p>
              <p className="mt-1 text-[0.875rem] leading-relaxed text-slate">
                {part.detail}
              </p>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Co-branding                                                                 */
/* -------------------------------------------------------------------------- */

/** Worked co-branding lockups showing acceptable relative prominence. */
export function CoBrandingExamples({
  examples,
}: {
  examples: {
    context: string;
    verdict: "use" | "avoid";
    note: string;
    lockup: "client-led" | "ww-led" | "equal";
  }[];
}) {
  return (
    <div className="grid gap-px border border-rule bg-rule @2xl:grid-cols-3">
      {examples.map((example) => (
        <div key={example.context} className="flex flex-col bg-surface">
          <div className="flex h-28 items-center justify-center border-b border-rule bg-neutral-tint px-5">
            {example.lockup === "client-led" && (
              <div className="flex w-full flex-col items-start gap-3">
                <span className="h-3.5 w-24 bg-charcoal" />
                <span className="flex items-center gap-1.5">
                  <span className="text-[0.5rem] font-semibold tracking-[0.14em] text-muted uppercase">
                    Prepared by
                  </span>
                  <span className="h-1.5 w-10 bg-teal" />
                </span>
              </div>
            )}
            {example.lockup === "ww-led" && (
              <div className="flex w-full flex-col items-start gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="h-3.5 w-20 bg-teal" />
                </span>
                <span className="text-[0.5rem] font-semibold tracking-[0.14em] text-muted uppercase">
                  Web Wizards
                </span>
              </div>
            )}
            {example.lockup === "equal" && (
              <div className="flex w-full items-center justify-center gap-4">
                <span className="h-3.5 w-20 bg-charcoal" />
                <span className="h-5 w-px bg-rule-strong" />
                <span className="h-3.5 w-20 bg-teal" />
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col px-5 py-5">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className={`h-1.5 w-1.5 shrink-0 ${
                  example.verdict === "use" ? "bg-teal" : "bg-rule-strong"
                }`}
              />
              <span
                className={`label ${
                  example.verdict === "use" ? "text-teal-ink" : "text-muted"
                }`}
              >
                {example.verdict === "use" ? "Use" : "Avoid"}
              </span>
            </div>
            <p className="mt-2.5 text-[0.9375rem] font-semibold text-charcoal">
              {example.context}
            </p>
            <p className="mt-1.5 text-[0.875rem] leading-relaxed text-slate">
              {example.note}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Logo library                                                                */
/* -------------------------------------------------------------------------- */

const LOGO_DIR = "/brand/logos";

export interface LogoVariant {
  /** Shared basename across svg/ and png/, e.g. "webwizards-dark-bg". */
  file: string;
  name: string;
  note: string;
  /** Preview backdrop. Files with a baked-in background sit on neutral so the
   *  block itself is visible; transparent files sit on the surface they are for. */
  surface: "light" | "charcoal" | "neutral";
  /** Size suffix on the matching PNG — lockups use widths, icons use px. */
  png: string;
}

/**
 * The approved logo files, previewed from the real SVGs in
 * public/brand/logos/svg/ and downloadable directly. No artwork is recreated
 * here: every preview is the shipped file rendered at size.
 */
export function LogoLibrary({ variants }: { variants: LogoVariant[] }) {
  const surfaces = {
    light: "bg-surface",
    charcoal: "bg-charcoal",
    neutral: "bg-neutral-tint",
  } as const;

  return (
    <div className="grid gap-px border border-rule bg-rule @xl:grid-cols-2">
      {variants.map((variant) => (
        <div key={variant.file} className="flex flex-col bg-surface">
          <div
            className={`flex h-[120px] items-center justify-center border-b border-rule px-6 ${
              surfaces[variant.surface]
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${LOGO_DIR}/svg/${variant.file}.svg`}
              alt={variant.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="flex flex-1 flex-col px-6 py-5">
            <p className="text-[0.9375rem] font-semibold text-charcoal">
              {variant.name}
            </p>
            <p className="mt-1.5 flex-1 text-[0.875rem] leading-relaxed text-slate">
              {variant.note}
            </p>
            <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              <a
                href={`${LOGO_DIR}/svg/${variant.file}.svg`}
                download
                className="label text-teal-ink underline underline-offset-2"
              >
                SVG
              </a>
              <a
                href={`${LOGO_DIR}/png/${variant.file}-${variant.png}.png`}
                download
                className="label text-teal-ink underline underline-offset-2"
              >
                PNG {variant.png}
              </a>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
