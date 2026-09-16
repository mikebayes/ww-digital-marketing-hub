/**
 * The concentric ring motif carried on Web Wizards proposal covers, rebuilt as
 * geometry rather than lifted as artwork.
 *
 * The source is three filled teal bands stepping lighter toward the middle,
 * centred just past the page corner so only a quadrant shows. That reading is
 * kept — same ring order, same tonal direction, same corner crop — but the
 * bands are drawn as strokes and the cover's halftone dot fill is dropped. A
 * proposal cover is allowed to be the loudest thing on the page; an internal
 * hub is not, and the full-strength version would have been.
 *
 * The rings are centred on the SVG's own bottom-right corner, so placing the
 * element flush to the corner of a clipped container reproduces the crop with
 * no negative offsets to keep in sync.
 */
export function RingMotif({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 118 118"
      fill="none"
      className={className}
    >
      <g transform="translate(118 118)" strokeWidth="21" opacity="0.62">
        {/* Outermost is darkest, innermost is brand teal, as on the cover. */}
        <circle r="107" stroke="var(--color-teal-ink)" />
        <circle r="81" stroke="var(--color-teal-deep)" />
        <circle r="55" stroke="var(--color-teal)" />
      </g>
    </svg>
  );
}
