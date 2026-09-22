import Image from "next/image";

/**
 * A product screenshot placed beside the instruction it illustrates.
 *
 * Framed with the same thin rule and neutral backdrop used everywhere else in
 * the Hub rather than a card, so a screenshot reads as evidence for the step
 * above it and not as a feature tile. Captions are optional and stay short:
 * if a caption has to explain the step, the step is not written well enough.
 */
export function Screenshot({
  src,
  alt,
  width,
  height,
  caption,
  /** Natural size, for a control small enough that scaling it up would blur it. */
  inline,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  inline?: boolean;
}) {
  return (
    <figure className={inline ? "" : "border border-rule bg-neutral-tint p-4"}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={
          inline
            ? "block border border-rule"
            : "block h-auto w-full max-w-full border border-rule bg-surface"
        }
        style={inline ? { width, height } : undefined}
      />
      {caption && (
        <figcaption className="mt-3 text-[0.8125rem] leading-relaxed text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
