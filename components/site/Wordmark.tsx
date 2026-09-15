import Image from "next/image";

/**
 * The Web Wizards horizontal lockup. Two static files rather than an inlined
 * SVG — the artwork is ~30KB of paths and does not belong in the JS bundle.
 */
export function Wordmark({
  tone = "dark",
  className = "",
  height = 26,
}: {
  /** "dark" = charcoal wordmark for light surfaces. "light" = white wordmark. */
  tone?: "dark" | "light";
  className?: string;
  height?: number;
}) {
  return (
    <Image
      src={tone === "light" ? "/ww-logo-light.svg" : "/ww-logo.svg"}
      alt="Web Wizards"
      width={Math.round((height * 1037) / 232)}
      height={height}
      className={className}
      priority
    />
  );
}
