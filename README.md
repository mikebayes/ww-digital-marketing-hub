# Web Wizards — Digital Marketing Hub

The internal operating hub for the Web Wizards Digital Marketing team. Internal
use only; there is no authentication yet, so treat the deployed URL as
unlisted rather than private.

## Running it

```bash
npm install
npm run dev
```

```bash
npm run build
```

Deploys to Vercel with no configuration — it is a standard Next.js App Router
project and every page is statically generated.

## How it is put together

| Path | What it holds |
| --- | --- |
| `lib/navigation.ts` | The information architecture. Single source of truth for every nav surface and every route. |
| `lib/site.ts` | Hub version and release date, shown in the rail and footer. |
| `content/` | Written modules, one component per module. |
| `content/registry.ts` | Maps `<section>/<entry>` to a module component. |
| `components/site/` | Shell: rail, mobile drawer, footer, wordmark. |
| `components/hub/` | Content vocabulary: sections, rule blocks, callouts, tables, example panels. |
| `lib/brand.ts` | Approved logo and favicon paths. Reference artwork through this, not by hard-coded path. |
| `public/brand/logos/` | The canonical Web Wizards logo library. Managed as a whole — do not move, rename or prune it. |
| `app/globals.css` | Design tokens. |

Routing is entirely config-driven. `app/[section]/page.tsx` renders section
indexes and `app/[section]/[entry]/page.tsx` renders modules, both from
`generateStaticParams` over `lib/navigation.ts`. There are no per-page route
files to maintain.

## Adding a module

1. Add or find the entry in `lib/navigation.ts`.
2. Write the component in `content/<section>/<entry>.tsx`, composing the
   primitives in `components/hub/`.
3. Register it in `content/registry.ts`.
4. Set the entry's `status` to `"published"`.
5. Bump `version` in `lib/site.ts`.

Entries left as `"planned"` still get a route, a nav position and a placeholder
page, so the shape of the system stays visible while it is being written.

## Brand assets

`public/brand/logos/` is the canonical library: SVG lockups (horizontal,
stacked, icon, in light and dark), PNG exports and a favicon set. Keep every
variant — a future Templates & Resources → Brand Assets page will expose them
as approved downloads.

`public/brand/derived/` holds the icon + wordmark lockups the Hub itself uses.
The canonical horizontal lockup includes a tagline that becomes an illegible
smudge below roughly 200px wide, so `scripts/build-lockups.mjs` copies the
official `icon` and `wordmark` groups **verbatim** into a tightly cropped
viewBox. No path data is altered, re-traced or redrawn. Rebuild with:

```bash
node scripts/build-lockups.mjs
```

## Document templates

`templates/` holds the print sources for downloadable documents; the rendered
PDFs and previews go to `public/templates/`. The Internal Service Brief is an
HTML source rendered to a one-page US Letter PDF through the locally installed
Chrome, so AI can regenerate a client-specific brief by editing the same
structure. The build fails rather than shipping a bad asset if Inter did not
load or the content has outgrown one page.

```bash
node scripts/build-brief-pdf.mjs
```

## Design system

Colour and typography are taken from current Web Wizards work rather than
invented — the teal is the logo fill (`#3ABFAF`) and the charcoal/neutral ramp
comes from the Goodies Bake Shop proposal.

Typography leans sans-serif, matching the current Web Wizards website. Fraunces
is present for the document side of the identity but is used sparingly on
screen; Inter carries headlines, body and labels.

Contrast is used deliberately rather than uniformly: a charcoal hero and rail
establish the property, and dense internal content sits on light surfaces where
it reads best.

Two deliberate departures, both documented in `app/globals.css`:

- **Structure.** The Hub is built from rules, grids and whitespace rather
  than the rounded cards and drop shadows used in proposal work, so it reads as
  an operating tool rather than a sales document.
- **Contrast.** Brand teal is never altered — it reaches only 2:1 on white, so
  it carries accents, rules and markers, not small text. `--color-teal-ink`
  (`#1F7D73`) and `--color-muted` (`#6E757D`) carry text and clear 4.5:1.

Layout components use container queries (`@md:`, `@xl:`, `@2xl:`) rather than
viewport breakpoints, so they adapt to the column they are placed in — the
content column narrows considerably once the in-page index appears.

The standard itself, at
`/standards/brand-document-deliverable-standards`, is the reference for
anything produced with these components.
