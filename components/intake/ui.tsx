import Link from "next/link";
import type { ReactNode } from "react";
import { phaseLabel } from "@/lib/intake/status";
import type { IntakeStatus } from "@/lib/intake/types";

/**
 * Shared vocabulary for the Intakes screens.
 *
 * Built from the same parts as the documentation pages — rules, labels, the
 * teal accent, tabular numerals — so an operational screen reads as the same
 * product as the standard it implements. No cards, no badges, no shadows.
 */

/** Status, carried by weight rather than by a coloured pill. */
export function StatusMark({ status }: { status: IntakeStatus }) {
  const live = status === "sent" || status === "in_progress";
  const done = status === "complete";

  return (
    <span
      className={`label whitespace-nowrap ${
        done ? "text-teal-ink" : live ? "text-charcoal" : "text-muted"
      }`}
    >
      {phaseLabel(status)}
    </span>
  );
}

export function PrimaryAction({
  href,
  children,
  type,
  disabled,
  name,
  value,
}: {
  href?: string;
  children: ReactNode;
  type?: "submit" | "button";
  disabled?: boolean;
  name?: string;
  value?: string;
}) {
  const className =
    "label inline-flex shrink-0 items-center gap-3 bg-charcoal px-5 py-3.5 text-white transition-colors hover:bg-teal-ink disabled:cursor-not-allowed disabled:bg-muted";

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
        <span aria-hidden className="h-px w-6 bg-teal" />
      </Link>
    );
  }

  return (
    <button
      type={type ?? "submit"}
      disabled={disabled}
      name={name}
      value={value}
      className={className}
    >
      {children}
      <span aria-hidden className="h-px w-6 bg-teal" />
    </button>
  );
}

export function SecondaryAction({
  href,
  children,
  type,
  name,
  value,
}: {
  href?: string;
  children: ReactNode;
  type?: "submit" | "button";
  name?: string;
  value?: string;
}) {
  const className =
    "label inline-flex shrink-0 items-center border border-rule-strong px-4 py-3 text-charcoal transition-colors hover:border-charcoal";

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type ?? "submit"} name={name} value={value} className={className}>
      {children}
    </button>
  );
}

/** A labelled form control in the Hub's register. */
export function Field({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-[0.9375rem] font-semibold text-charcoal"
      >
        {label}
      </label>
      {hint && (
        <p className="mt-1.5 text-[0.875rem] leading-relaxed text-slate">{hint}</p>
      )}
      <div className="mt-3">{children}</div>
    </div>
  );
}

export const inputClass =
  "block w-full border border-rule-strong bg-surface px-3.5 py-2.5 text-[0.9375rem] text-charcoal placeholder:text-muted focus:border-teal-ink focus:outline-none";

export const textareaClass = `${inputClass} min-h-[5.5rem] leading-relaxed`;

/** Empty state, written as a sentence rather than as an illustration. */
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="border border-dashed border-rule-strong bg-surface px-6 py-10 text-center">
      <p className="text-[0.9375rem] leading-relaxed text-slate">{children}</p>
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn"; children: ReactNode }) {
  return (
    <aside className="overflow-hidden rounded-lg border border-rule-strong bg-surface">
      <p className="label border-b border-rule-strong bg-rule px-6 py-3 text-charcoal">
        {tone === "warn" ? "Check this" : "Note"}
      </p>
      <div className="max-w-2xl px-6 py-5 text-[0.9375rem] leading-relaxed text-slate [&_p+p]:mt-3 [&_strong]:font-semibold [&_strong]:text-charcoal">
        {children}
      </div>
    </aside>
  );
}

/** Date as a short, scannable string. Intentionally not relative. */
export function ShortDate({ value }: { value: string | null }) {
  if (!value) return <span className="text-muted">—</span>;
  const date = new Date(value);
  return (
    <span className="tabular-nums">
      {date.toLocaleDateString("en-CA", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}
    </span>
  );
}
