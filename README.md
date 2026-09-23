# Web Wizards — Digital Marketing Hub

The internal operating hub for the Web Wizards Digital Marketing team. Internal
use only; there is no authentication yet, so treat the deployed URL as
unlisted rather than private.

Every page carries a `noindex, nofollow` meta tag and every route returns an
`X-Robots-Tag` header, so the Hub stays out of search results. `app/robots.ts`
deliberately allows crawling — blocking it would stop crawlers reading those
directives. None of that is access control: anyone with the URL can read it.

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
PDFs and previews go to `public/templates/`. Each is an HTML source rendered to
a one-page US Letter PDF through the locally installed Chrome, so AI can
regenerate a client-specific version by editing the same structure. The build
fails rather than shipping a bad asset if Inter did not load or the content has
outgrown one page. Add a document by appending to DOCS in the script.

```bash
node scripts/build-pdfs.mjs
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

---

## Client Intakes

The first operational module in the Hub. Everything above this section is static
documentation; this part holds real client information, and is the reason the
Hub now has a database and a sign-in.

### How it fits together

```
/intakes                    list
/intakes/new                pick client, services, Account Manager
/intakes/[id]               internal record, answers, lifecycle actions
/intakes/[id]/edit          prepare the questionnaire
/intakes/[id]/preview       the client's page, read-only
/intake/[token]             the client's page, live
```

`/intake/[token]` is the only route a client ever sees. It renders outside the
`app/(hub)` route group, so the internal rail, module index and footer do not
exist on it — they are not hidden, they are not rendered.

### Questions

Question wording lives in `question_definitions`, per service. Creating an
intake **copies** the relevant definitions into `intake_questions`, so editing
the master library later cannot change what a client was asked last quarter.
The Common set is always included.

Two columns drive the client experience:

- `client_visible` — false makes a question internal preparation. This is how
  proposal summaries, handoff context and observations are stored without a
  second table.
- `client_step` / `client_step_order` — the step the client sees the question
  under. Steps come from the data, so Common and Social Media questions merge
  into one "Audience & Content Direction" step, and adding SEO later is a seed
  data change rather than a form change.

`required_mode` of `required_by_completion` means Web Wizards must resolve the
answer before finishing. It never blocks the client from submitting; it shows up
on the intake page under **Still Outstanding** as the kickoff list.

### Supabase setup

One Supabase project serves the whole Hub.

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/migrations/0001_intakes.sql`.
3. In the SQL editor, run `supabase/seed.sql`. It is safe to re-run — every
   insert is `ON CONFLICT DO NOTHING`, so edits to the question library survive.
4. **Authentication → Providers → Azure**: enable it, and set the Application
   (client) ID, the client secret and the Azure Tenant URL for the Web Wizards
   Microsoft Entra tenant. Turn **Allow users without an email** off — the
   application checks the email domain, so an identity without one cannot be
   admitted. Microsoft is the only staff sign-in method.
5. **Authentication → URL Configuration**: add your deployed origin and
   `http://localhost:3000` to the redirect allow list, both with `/auth/callback`.
   Until this is done Supabase substitutes the Site URL and the sign-in comes
   back to `/`; `oauthLandingTarget` in `lib/auth/access.ts` catches that so
   sign-in still works, but the list is the real fix.
6. **Authentication → Providers → Email**: turn it off. Nothing uses it, and
   leaving it on keeps a second way into an internal application.
7. **Authentication → Sign-ups**: staff accounts are created by their first
   Microsoft sign-in, so sign-ups must be allowed. With the email provider off
   and the Azure provider tenant-restricted, the only identity that can create
   an account is one that already belongs to Web Wizards.
8. Copy `.env.example` to `.env.local` and fill in the three values from
   **Project settings → API**. Set the same three in Vercel.

### Environment variables

| Variable | Secret | Used by |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | no | everything |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | no | Microsoft sign-in and internal queries |
| `SUPABASE_SERVICE_ROLE_KEY` | **yes** | the public questionnaire only |

The service role key bypasses Row Level Security. It is read by
`lib/supabase/admin.ts`, which is marked `server-only` — importing it from a
client component is a build error.

### Security model

Two access paths exist, and only two.

**Staff** sign in with Microsoft against the Web Wizards Entra tenant.
`proxy.ts` gates the entire application and denies by default: a request is
authenticated unless `lib/auth/access.ts` exempts it, so a route added later is
protected because nobody remembered to protect it rather than exposed because
nobody remembered to list it. It also fails closed — an unconfigured deployment
redirects to `/login` rather than assuming nobody is signed in.

Authenticating is not the same as being staff, so the email domain is checked
in application code as well: the callback signs out an identity that does not
carry a `@webwizards.ca` address before a session cookie is kept, and the proxy
checks again on every request. Internal queries run as the `authenticated` role
under the RLS policies in the migration, so a policy mistake breaks an internal
screen rather than silently reading past the rules.

**Clients** hold a token. It is 32 bytes of CSPRNG output, base64url encoded,
generated in `lib/intake/token.ts` — sized as a credential, not as an id. The
public route never talks to PostgREST from the browser; it is server-rendered
through `lib/intake/public-queries.ts`, and anonymous callers have no RLS policy
on any table, so a leaked anon key reads nothing.

Internal content is kept in by four independent things:

1. RLS grants `anon` nothing.
2. The public query names its columns, and `internal_notes` and `final_answer`
   are not among them.
3. The query filters on `included` and `client_visible`.
4. `lib/intake/public.ts` rebuilds each question field by field into a separate
   `PublicQuestion` type, so an internal field added later cannot reach a client
   by being forgotten about.

Writes from the client are restricted server-side to the questions that intake
actually exposed as editable; anything else in the payload is discarded.

A bad token, an unsent intake and a nonexistent intake all return the same 404.

**The questionnaire never asks for credentials.** The intro says so, and any
step whose title mentions access repeats it.

### Tests

```bash
npm test
```

Node's built-in runner over the pure logic — the public projection, answer
normalisation, token generation and the lifecycle. No test framework, no
transpile step; Node runs the TypeScript directly.

The database layer is not covered by automated tests. It needs a live Supabase
project, which is worth adding when there is one to point at.
