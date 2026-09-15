# Web Wizards — Digital Marketing Playbook

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
| `lib/site.ts` | Playbook version and release date, shown in the rail and footer. |
| `content/` | Written modules, one component per module. |
| `content/registry.ts` | Maps `<section>/<entry>` to a module component. |
| `components/site/` | Shell: rail, mobile drawer, footer, wordmark. |
| `components/playbook/` | Content vocabulary: sections, rule blocks, callouts, tables, example panels. |
| `app/globals.css` | Design tokens. |

Routing is entirely config-driven. `app/[section]/page.tsx` renders section
indexes and `app/[section]/[entry]/page.tsx` renders modules, both from
`generateStaticParams` over `lib/navigation.ts`. There are no per-page route
files to maintain.

## Adding a module

1. Add or find the entry in `lib/navigation.ts`.
2. Write the component in `content/<section>/<entry>.tsx`, composing the
   primitives in `components/playbook/`.
3. Register it in `content/registry.ts`.
4. Set the entry's `status` to `"published"`.
5. Bump `version` in `lib/site.ts`.

Entries left as `"planned"` still get a route, a nav position and a placeholder
page, so the shape of the system stays visible while it is being written.

## Design system

Colour and typography are taken from current Web Wizards work rather than
invented — the teal is the logo fill (`#3ABFAF`) and the charcoal/neutral ramp
comes from the Goodies Bake Shop proposal. Typography is the established
Inter + Fraunces pairing.

Two deliberate departures, both documented in `app/globals.css`:

- **Structure.** The playbook is built from rules, grids and whitespace rather
  than the rounded cards and drop shadows used in proposal work, so it reads as
  an operating tool rather than a sales document.
- **Contrast.** Brand teal reaches only 2:1 on white and the lighter secondary
  grey 3.2:1, so neither is used for small text. `--color-teal-ink` (`#1F7D73`)
  and `--color-muted` (`#6E757D`) carry text and clear 4.5:1.

Layout components use container queries (`@md:`, `@xl:`, `@2xl:`) rather than
viewport breakpoints, so they adapt to the column they are placed in — the
content column narrows considerably once the in-page index appears.

The standard itself, at
`/standards/brand-document-deliverable-standards`, is the reference for
anything produced with these components.
