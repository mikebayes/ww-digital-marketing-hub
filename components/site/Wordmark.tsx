import Image from "next/image";
import { logos } from "@/lib/brand";

/**
 * The official Web Wizards lockup.
 *
 * Rendered from the approved SVG in `public/brand/` rather than inlined — the
 * artwork is several thousand path commands and does not belong in the JS
 * bundle. Proportions are locked to the source viewBox; only `height` varies.
 */
export function Wordmark({
  tone = "dark",
  className = "",
  height = 30,
}: {
  /** "dark" = near-black wordmark for light surfaces. "light" = white wordmark. */
  tone?: "dark" | "light";
  className?: string;
  height?: number;
}) {
  const logo = tone === "light" ? logos.lockupOnDark : logos.lockupOnLight;

  return (
    <Image
      src={logo.src}
      alt="Web Wizards"
      width={Math.round((height * logo.width) / logo.height)}
      height={height}
      className={className}
      priority
    />
  );
}
