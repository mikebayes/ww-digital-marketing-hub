/**
 * Composes an icon + wordmark lockup from the official Web Wizards logo SVGs.
 *
 * The canonical horizontal lockup in public/brand/logos/svg/ includes a
 * tagline group that renders as an illegible smudge below ~200px wide. The
 * library exposes `icon`, `wordmark` and `tagline` as separate groups exactly
 * so components can be used individually, so this script copies the `icon` and
 * `wordmark` groups VERBATIM (no path data is altered, re-traced or redrawn)
 * into a tightly cropped viewBox.
 *
 * Source of truth stays public/brand/logos/. Output goes to public/brand/derived/.
 * Re-run with: node scripts/build-lockups.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const SRC = "public/brand/logos/svg";
const OUT = "public/brand/derived";

/** Pull a top-level <g id="..."> block, balancing nested <g> tags. */
function extractGroup(svg, id) {
  const start = svg.indexOf(`<g id="${id}"`);
  if (start === -1) throw new Error(`group ${id} not found`);
  let depth = 0;
  let i = start;
  while (i < svg.length) {
    if (svg.startsWith("<g", i)) depth++;
    else if (svg.startsWith("</g>", i)) {
      depth--;
      if (depth === 0) return svg.slice(start, i + 4);
    }
    i++;
  }
  throw new Error(`group ${id} unbalanced`);
}

/** Bounding box over every coordinate pair in the group's path data. */
function bbox(group) {
  const translate = group.match(/translate\((-?[\d.]+)[ ,]+(-?[\d.]+)\)/);
  const tx = translate ? +translate[1] : 0;
  const ty = translate ? +translate[2] : 0;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const d of group.matchAll(/ d="([^"]+)"/g)) {
    const nums = d[1].match(/-?[\d.]+/g)?.map(Number) ?? [];
    for (let i = 0; i + 1 < nums.length; i += 2) {
      const x = nums[i] + tx;
      const y = nums[i + 1] + ty;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  return { minX, minY, maxX, maxY };
}

function build({ source, out, label }) {
  const svg = readFileSync(`${SRC}/${source}`, "utf8");
  const icon = extractGroup(svg, "icon");
  const wordmark = extractGroup(svg, "wordmark");

  const a = bbox(icon);
  const b = bbox(wordmark);
  const pad = 2;
  const x = Math.min(a.minX, b.minX) - pad;
  const y = Math.min(a.minY, b.minY) - pad;
  const w = Math.max(a.maxX, b.maxX) + pad - x;
  const h = Math.max(a.maxY, b.maxY) + pad - y;

  const result = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}" role="img" aria-label="Web Wizards">
  <title>Web Wizards</title>
  <!-- Icon and wordmark copied verbatim from ${source}. Tagline omitted: it is
       not legible at the sizes this lockup is used. -->
${icon}
${wordmark}
</svg>
`;

  mkdirSync(OUT, { recursive: true });
  writeFileSync(`${OUT}/${out}`, result);
  console.log(`${out}  ${w.toFixed(0)}x${h.toFixed(0)}  (${label})`);
}

build({ source: "webwizards-dark-bg.svg", out: "webwizards-lockup-on-dark.svg", label: "white wordmark, for dark surfaces" });
build({ source: "webwizards-light-bg.svg", out: "webwizards-lockup-on-light.svg", label: "dark wordmark, for light surfaces" });
