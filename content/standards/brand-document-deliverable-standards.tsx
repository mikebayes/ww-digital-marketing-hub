import {
  PageHeader,
  Section,
  Subsection,
  RuleBlock,
  Callout,
  ExamplePanel,
  DefinitionTable,
} from "@/components/hub/primitives";
import { OnThisPage, type TocItem } from "@/components/hub/OnThisPage";
import {
  SwatchGrid,
  TypeSpecimen,
  OwnershipMatrix,
  DocumentAnatomy,
  CoBrandingExamples,
} from "@/components/hub/brand";

const toc: TocItem[] = [
  { id: "scope", marker: "01", title: "What This Standard Covers" },
  { id: "visual-system", marker: "02", title: "Visual System" },
  { id: "ownership", marker: "03", title: "Which Brand Should This Carry?" },
  { id: "document-standards", marker: "04", title: "Document Standards" },
  { id: "reference-work", marker: "05", title: "Current Visual Direction" },
];

export default function BrandDocumentDeliverableStandards() {
  return (
    <div className="px-6 pt-10 pb-4 md:px-12 lg:px-16 lg:pt-14">
      <PageHeader
        title="Brand, Document & Deliverable Standards"
        lede="How Web Wizards work should look, whose brand it carries, and what a finished document needs."
        breadcrumb={[
          { label: "Hub", href: "/" },
          { label: "Standards", href: "/standards" },
          { label: "Brand, Document & Deliverable Standards" },
        ]}
        meta={[
          { label: "Applies to", value: "All Web Wizards work" },
          { label: "Owner", value: "Web Wizards" },
          { label: "Status", value: "In effect" },
          { label: "Version", value: "0.1 · Sept 2026" },
        ]}
      />

      <div className="mt-12 grid gap-12 min-[1400px]:grid-cols-[minmax(0,1fr)_var(--spacing-toc)] min-[1400px]:gap-14">
        <article className="@container min-w-0 space-y-12">
          {/* ---------------------------------------------------------------- */}
          <Section
            id="scope"
            marker="01"
            title="What This Standard Covers"
            intro={
              <>
                <p>
                  This applies to anything Web Wizards produces that someone
                  else reads — internal documentation and client-facing work
                  alike. It is a working standard, not a brand bible. If a piece
                  of work is better for breaking something here, break it and
                  say so, so the standard can catch up.
                </p>
                <p>
                  The Web Wizards website is the primary visual reference.
                  Recent proposal work extends that identity into formal
                  documents; see{" "}
                  <a href="#reference-work">Current Visual Direction</a>.
                </p>
              </>
            }
          >
            <DefinitionTable
              rows={[
                {
                  term: "Applies to",
                  detail:
                    "Documentation, procedures, strategies, audits, reports, proposals, presentations, and marketing material we produce for clients.",
                },
                {
                  term: "Does not apply to",
                  detail:
                    "Email, Slack, meeting notes and working files. Don't format a status update like a quarterly review.",
                },
                {
                  term: "When in doubt",
                  detail:
                    "Ask before the work is finished. A five-minute question about whose brand a deliverable carries is cheaper than rebuilding it.",
                },
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section id="visual-system" marker="02" title="Visual System">
            <Subsection title="Colour" eyebrow="02.1">
              <p>
                Charcoal, white and teal carry almost everything. Anything
                outside this list needs a reason you can explain.
              </p>
            </Subsection>

            <SwatchGrid
              caption="Core"
              swatches={[
                {
                  name: "Charcoal",
                  hex: "#1C1F23",
                  role: "Primary ink. Dark surfaces, covers, section pages, headings.",
                  on: "dark",
                },
                {
                  name: "Teal",
                  hex: "#3ABFAF",
                  role: "The brand accent, taken from the logo. Markers, rules, fills, highlights.",
                  on: "light",
                },
                {
                  name: "White",
                  hex: "#FFFFFF",
                  role: "Primary surface for documents and content pages.",
                  on: "light",
                },
              ]}
            />

            <SwatchGrid
              caption="Supporting"
              swatches={[
                {
                  name: "Ink",
                  hex: "#0C0D0D",
                  role: "Deepest black. Full-bleed covers and section dividers.",
                  on: "dark",
                },
                {
                  name: "Slate",
                  hex: "#4A4F57",
                  role: "Body copy on light surfaces.",
                  on: "dark",
                },
                {
                  name: "Secondary grey",
                  hex: "#6E757D",
                  role: "Captions, labels and metadata.",
                  on: "dark",
                },
                {
                  name: "Rule",
                  hex: "#E4E7EA",
                  role: "Hairlines, borders and grid separators.",
                  on: "light",
                },
                {
                  name: "Neutral",
                  hex: "#F2F3F4",
                  role: "Light panels where white would flatten the layout.",
                  on: "light",
                },
                {
                  name: "Teal tint",
                  hex: "#EDF7F5",
                  role: "Highlight fields and callouts. Loses its effect when repeated.",
                  on: "light",
                },
              ]}
            />

            <Callout label="Contrast — this one is a rule">
              <p>
                <strong>The brand teal does not change.</strong> #3ABFAF stays
                exactly as it is for accents, rules, markers and graphics. But
                it only reaches 2:1 on white, so it cannot carry small text
                there — use <strong>#1F7D73</strong> instead. On charcoal, brand
                teal is fine for text as-is.
              </p>
              <p>
                Same logic for grey: use <strong>#6E757D</strong> for small
                secondary text on white, not the lighter grey that appears in
                recent work.
              </p>
            </Callout>

            <Subsection title="Logo" eyebrow="02.2">
              <p>
                The official library is the only source of Web Wizards artwork.
                Never redraw it, trace it, set it as type or rebuild it from a
                screenshot, and never stretch it.
              </p>
            </Subsection>

            <DefinitionTable
              caption="Choosing a variant"
              rows={[
                {
                  term: "Dark surfaces",
                  detail:
                    "Horizontal lockup, white wordmark. The default for charcoal covers, section pages and dark UI.",
                },
                {
                  term: "Light surfaces",
                  detail:
                    "Horizontal lockup, near-black wordmark. The default for white document pages and light UI.",
                },
                {
                  term: "Narrow or tall spaces",
                  detail:
                    "Stacked lockup, where the horizontal version would have to be set too small to read.",
                },
                {
                  term: "Avatars and app icons",
                  detail:
                    "Icon only. Use the supplied icon file rather than cropping the horizontal lockup.",
                },
                {
                  term: "Small sizes",
                  detail:
                    "Drop the tagline where it would be an unreadable smudge — the SVGs separate it into its own group for exactly this. Below roughly 120px wide, switch to the icon.",
                },
              ]}
            />

            <Subsection title="Typography" eyebrow="02.3">
              <p>
                Inter carries everything: headings, body, labels, tables.
                Fraunces is an editorial accent — covers, section pages, pull
                quotes — and documents can lean on it harder than screens do.
                Don&rsquo;t add a third typeface.
              </p>
            </Subsection>

            <TypeSpecimen
              typefaces={[
                {
                  name: "Inter",
                  role: "Primary",
                  sample: "Aa 0123",
                  notes:
                    "Weights 400–700. Tighten letter-spacing on large headings; open it to roughly 0.16em on small uppercase labels.",
                },
                {
                  name: "Fraunces",
                  role: "Display",
                  sample: "Aa 0123",
                  display: true,
                  notes:
                    "Never for body copy or anything below about 20px.",
                },
              ]}
            />

            <Subsection title="Layout" eyebrow="02.4">
              <p>
                What makes the work recognisable is grid, space and hairlines
                rather than colour.
              </p>
            </Subsection>

            <RuleBlock
              items={[
                {
                  title: "Build on a visible grid",
                  body: "Columns should be obvious without gridlines. Things line up; where they don't, it should read as deliberate.",
                },
                {
                  title: "Protect whitespace",
                  body: "If a page feels tight, cut content or add a page. Never shrink type or margins to make something fit.",
                },
                {
                  title: "Thin rules before boxes",
                  body: "A 1px rule separates as well as a border and weighs far less. Use a full box only when a block genuinely needs lifting off the page.",
                },
                {
                  title: "Teal is an accent, not a theme",
                  body: "Markers, rules, small highlights. If a page reads as teal, there's too much of it.",
                },
                {
                  title: "Imagery and icons earn their place",
                  body: "Real photography or texture, cropped to the grid. Single-weight line icons only, and only where a label won't do. No stock illustration and no generic AI imagery — abstract renders, glowing networks, stock futurism. If you can't say why an element is on the page, take it off.",
                },
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="ownership"
            marker="03"
            title="Which Brand Should This Carry?"
            intro={
              <p>
                Answer one question first: <strong>who is this for?</strong>{" "}
                Almost everything falls into one of three categories. Follow the
                default unless there is a specific reason not to.
              </p>
            }
          >
            <OwnershipMatrix
              categories={[
                {
                  marker: "Category A",
                  title: "Web Wizards-owned material",
                  branding: "Web Wizards brand",
                  weight: { ww: 100, client: 0 },
                  rationale:
                    "Our thinking, our method, our commercial position. It belongs to us and should look like it.",
                  examples: [
                    "Internal standards and procedures",
                    "Methodologies and frameworks",
                    "Operating documentation",
                    "Service and capability material",
                    "Proposals and pricing",
                  ],
                },
                {
                  marker: "Category B",
                  title: "Client-specific professional deliverables",
                  branding: "Client-led, co-branded",
                  weight: { ww: 25, client: 75 },
                  rationale:
                    "This lives inside the client's business — circulated internally, shown to their board, used to make decisions. It should feel like their document, prepared by us.",
                  examples: [
                    "Strategies and roadmaps",
                    "Audits and research",
                    "Marketing plans",
                    "Monthly and quarterly reports",
                    "Executive summaries and recommendations",
                  ],
                },
                {
                  marker: "Category C",
                  title: "Customer-facing client marketing",
                  branding: "Client brand only",
                  weight: { ww: 0, client: 100 },
                  rationale:
                    "The audience is the client's customer, who has no relationship with us. Our logo here is noise.",
                  examples: [
                    "Brochures and collateral",
                    "Advertising creative",
                    "Social graphics",
                    "Campaign assets",
                    "Landing page creative",
                  ],
                },
              ]}
            />

            <CoBrandingExamples
              examples={[
                {
                  context: "Client-led deliverable",
                  verdict: "use",
                  lockup: "client-led",
                  note: "Client logo at full size. Web Wizards as a small 'Prepared by' mark on the cover and in the footer.",
                },
                {
                  context: "Web Wizards-owned material",
                  verdict: "use",
                  lockup: "ww-led",
                  note: "Our mark alone. No client branding unless the client is the subject.",
                },
                {
                  context: "Matched-size lockup",
                  verdict: "avoid",
                  lockup: "equal",
                  note: "Reads as a joint venture rather than a service relationship. Rarely what's true.",
                },
              ]}
            />

            <RuleBlock
              items={[
                {
                  title: "Prominence follows the audience",
                  body: "Whoever the material is for goes first. If the audience is the client's customer, we're not on it at all — not in the artwork, not in the footer, not in the filename. Attribution goes in the delivery email.",
                },
                {
                  title: "Attribution is text, not a second logo",
                  body: "'Prepared by Web Wizards' in a small label is more confident than a competing lockup.",
                },
                {
                  title: "Use client-supplied assets",
                  body: "Never recreate a client's logo. If all they have is a low-resolution file, ask for a better one during onboarding.",
                },
                {
                  title: "Their brand guide wins",
                  body: "On Category B and C work, the client's guidelines beat ours. Ask for them at onboarding rather than reverse-engineering from their website.",
                },
                {
                  title: "Two brands is the ceiling",
                  body: "Platform logos, certification badges and partner marks scattered across a cover undo everything else.",
                },
              ]}
            />

            <Callout label="Unclear cases">
              <p>
                Ask who will look at it and where it ends up. A strategy the
                client presents internally is B. A one-pager we hand out at a
                conference is A. A case study featuring a client is A, with
                their permission.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="document-standards"
            marker="04"
            title="Document Standards"
            intro={
              <p>
                A finished document should say what it is, who it is for, when
                it was written and who prepared it — without the reader having
                to ask. That is the bar. This is not document control; there is
                no approval matrix to maintain.
              </p>
            }
          >
            <DocumentAnatomy
              parts={[
                {
                  zone: "Cover",
                  requirement: "Title, audience and date",
                  detail:
                    "Plus a one-line purpose where the title doesn't make it obvious.",
                },
                {
                  zone: "Attribution",
                  requirement: "Prepared by, where appropriate",
                  detail:
                    "On Category A and B material. Absent entirely on Category C.",
                },
                {
                  zone: "Hierarchy",
                  requirement: "No deeper than three levels",
                  detail:
                    "If you need a fourth, the section probably needs splitting.",
                },
                {
                  zone: "Body",
                  requirement: "Readable density",
                  detail:
                    "A page that has to be shrunk to fit is a page that needs to be two pages.",
                },
                {
                  zone: "Footer",
                  requirement: "Consistent on every page",
                  detail:
                    "Document title, page number, client name where relevant — including section dividers.",
                },
                {
                  zone: "Version",
                  requirement: "When the document will keep changing",
                  detail:
                    "A strategy that gets revised carries a version and date. A one-off proposal doesn't need one.",
                },
              ]}
            />

            <Callout label="File naming" tone="charcoal">
              <p>
                File names travel further than covers do. Use{" "}
                <strong>Client — Document Type — YYYY-MM</strong>, dropping the
                client name for internal work. Never send{" "}
                <strong>Proposal_v3_FINAL_2.pdf</strong>.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="reference-work"
            marker="05"
            title="Current Visual Direction"
            intro={
              <p>
                Two recent pieces show where the identity currently sits. They
                are reference points, not templates — take the principles, not
                the layouts. Both files sit with the Digital Marketing lead.
              </p>
            }
          >
            <ExamplePanel
              label="Reference 01 · Document"
              title="Goodies Bake Shop — Digital Marketing Proposal"
              demonstrates={[
                "The neutral ramp: charcoal, slate, grey, hairline rule",
                "Teal held to an accent across a full document",
                "Dark section pages against light, dense content pages",
                "Fine rules carrying structure instead of boxes and shadows",
              ]}
              takeaway="The current benchmark for a formal Web Wizards document. Match this level of restraint before adding anything of your own."
            >
              <div className="flex flex-wrap">
                {[
                  "#1C1F23",
                  "#4A4F57",
                  "#6E757D",
                  "#E4E7EA",
                  "#F2F3F4",
                  "#EDF7F5",
                  "#3ABFAF",
                  "#2E9C90",
                ].map((hex) => (
                  <div
                    key={hex}
                    className="h-12 flex-1 basis-16"
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
              </div>
            </ExamplePanel>

            <ExamplePanel
              label="Reference 02 · Presentation"
              title="SpeedPro Canada — Digital Growth Discussion"
              demonstrates={[
                "Section labels and numbered markers used consistently as navigation",
                "Structured information layouts — comparison tables, stat rows, staged diagrams",
                "Client and Web Wizards branding coexisting without competing",
              ]}
              takeaway="Take the information design and the labelling discipline. Don't take the format — sequential slide-style panels belong in a pitch, not in a strategy or report someone will refer back to."
            />
          </Section>
        </article>

        <aside className="hidden min-[1400px]:block">
          <OnThisPage items={toc} />
        </aside>
      </div>
    </div>
  );
}
