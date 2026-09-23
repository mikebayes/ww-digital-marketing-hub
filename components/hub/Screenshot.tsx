import Image from "next/image";

/**
 * A product screenshot placed beside the instruction it illustrates.
 *
 * Sized to stay subordinate to the text. Two rules do that: never render wider
 * than the image's own pixels, so a wizard dialog is not blown up to fill a
 * 1135px column on a large display; and never exceed CAP, so the wide captures
 * of a full Productive screen do not become the loudest thing on the page.
 * Below those, it shrinks with the column.
 *
 * Clicking opens the original file at full size, which costs one anchor and
 * means the cap never hides detail from someone who needs it.
 *
 * Framed with the same thin rule and neutral backdrop used everywhere else in
 * the Hub rather than a card. Captions stay short: if a caption has to explain
 * the step, the step is not written well enough.
 */
const CAP = 640;

export function Screenshot({
  src,
  alt,
  width,
  height,
  caption,
  /** Natural size, for a control small enough that scaling it would blur it. */
  inline,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  inline?: boolean;
}) {
  if (inline) {
    return (
      <figure>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="block border border-rule"
          style={{ width, height }}
        />
        {caption && <Caption>{caption}</Caption>}
      </figure>
    );
  }

  const displayWidth = Math.min(width, CAP);

  return (
    <figure className="max-w-full" style={{ width: displayWidth }}>
      <a
        href={src}
        target="_blank"
        rel="noreferrer"
        className="group block border border-rule bg-neutral-tint p-2.5 transition-colors hover:border-rule-strong"
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="block h-auto w-full border border-rule bg-surface"
          sizes={`${displayWidth}px`}
        />
        <span className="label mt-2 block text-right text-muted transition-colors group-hover:text-teal-ink">
          View full size
        </span>
      </a>
      {caption && <Caption>{caption}</Caption>}
    </figure>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <figcaption className="mt-2.5 text-[0.8125rem] leading-relaxed text-muted">
      {children}
    </figcaption>
  );
}
