import {
  PageHeader,
  Section,
  Subsection,
  RuleBlock,
  Callout,
  DoAvoid,
  ExamplePanel,
  DefinitionTable,
} from "@/components/playbook/primitives";
import { OnThisPage, type TocItem } from "@/components/playbook/OnThisPage";
import {
  SwatchGrid,
  TypeSpecimen,
  OwnershipMatrix,
  ApplicationSplit,
  DocumentAnatomy,
  CoBrandingExamples,
} from "@/components/playbook/brand";

const toc: TocItem[] = [
  { id: "purpose", marker: "01", title: "Purpose & Application" },
  { id: "brand-direction", marker: "02", title: "Brand Direction" },
  { id: "visual-system", marker: "03", title: "Core Visual System" },
  { id: "applications", marker: "04", title: "Digital & Document Applications" },
  { id: "ownership", marker: "05", title: "Branding & Ownership Rules" },
  { id: "co-branding", marker: "06", title: "Co-Branding" },
  { id: "document-standards", marker: "07", title: "Document Standards" },
  { id: "design-principles", marker: "08", title: "Design Principles" },
  { id: "examples", marker: "09", title: "Approved Direction" },
];

export default function BrandDocumentDeliverableStandards() {
  return (
    <div className="px-6 pt-10 pb-4 md:px-12 lg:px-16 lg:pt-14">
      <PageHeader
        title="Brand, Document & Deliverable Standards"
        lede="How Web Wizards work should look, whose brand it carries, and what a finished document needs. It applies to anything we produce — internal or client-facing."
        breadcrumb={[
          { label: "Playbook", href: "/" },
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

      <div className="mt-12 grid gap-12 xl:grid-cols-[minmax(0,1fr)_var(--spacing-toc)] xl:gap-14">
        <article className="@container min-w-0 space-y-12">
          {/* ---------------------------------------------------------------- */}
          <Section
            id="purpose"
            marker="01"
            title="Purpose & Application"
            intro={
              <>
                <p>
                  This standard exists so that Web Wizards work looks like Web
                  Wizards work. Not because consistency is a virtue in itself,
                  but because a client who receives a strategy, a report and a
                  proposal over eighteen months should recognise all three as
                  coming from the same team.
                </p>
                <p>
                  It is a set of decisions already made, so you do not have to
                  make them again on every deliverable. It is not a rulebook to
                  be enforced line by line. If a piece of work needs to break
                  something here to be better, break it — then say so, so the
                  standard can catch up.
                </p>
              </>
            }
          >
            <DefinitionTable
              caption="Scope"
              rows={[
                {
                  term: "Applies to",
                  detail:
                    "Internal documentation, operating procedures, client-facing strategies, audits, reports, proposals, presentations and any marketing material Web Wizards produces or produces on a client's behalf.",
                },
                {
                  term: "Does not apply to",
                  detail:
                    "Day-to-day email, Slack, meeting notes and working files. Use judgement; do not format a status update like a quarterly review.",
                },
                {
                  term: "Who it is for",
                  detail:
                    "Everyone who produces work that leaves their own screen — strategists, specialists, account leads, designers and anyone writing a document a client will read.",
                },
                {
                  term: "When in doubt",
                  detail:
                    "Ask before the work is finished, not after. A five-minute question about whose brand a deliverable carries is cheaper than rebuilding it.",
                },
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="brand-direction"
            marker="02"
            title="Brand Direction"
            intro={
              <>
                <p>
                  The current Web Wizards identity is modern, technical,
                  confident and understated. It reads as a team that knows what
                  it is doing and does not need to shout about it.
                </p>
                <p>
                  <strong>
                    The Web Wizards website is the primary visual reference going
                    forward.
                  </strong>{" "}
                  Where this document and the website disagree, the website is
                  the direction and this document needs updating.
                </p>
                <p>
                  Recent proposal and document work — the Goodies Bake Shop
                  proposal and the SpeedPro Canada discovery deck — extends that
                  language into formal business materials. Those pieces
                  established the document side of the identity: the same
                  palette and typography, applied with more editorial structure
                  than a web page needs.
                </p>
              </>
            }
          >
            <Callout label="On evolution">
              <p>
                The visual system will keep moving. That is fine. What matters
                is that work produced <strong>today</strong> looks like it came
                from the same organisation as the work produced last quarter.
                Drift is acceptable; a different-looking deliverable every time
                is not.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="visual-system"
            marker="03"
            title="Core Visual System"
            intro={
              <p>
                The values below are taken from current Web Wizards work — the
                logo artwork and the recent proposal documents — rather than
                invented. Treat them as the working system, not a ratified brand
                specification. Where a formal brand guide exists or is created,
                it supersedes this.
              </p>
            }
          >
            <Subsection title="Colour" eyebrow="03.1">
              <p>
                Near-black, white and teal carry almost everything. The neutrals
                exist to create structure without adding colour. Nothing else
                should appear without a reason you can explain.
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
                  role: "The brand accent. Taken from the logo mark. Markers, rules, fills, small highlights.",
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
                  role: "Deepest black. Full-bleed covers and section dividers where charcoal is not quite enough.",
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
                  role: "Captions, labels and metadata. See the contrast note below.",
                  on: "dark",
                },
                {
                  name: "Rule",
                  hex: "#E4E7EA",
                  role: "Hairlines, borders and grid separators. The structural workhorse.",
                  on: "light",
                },
                {
                  name: "Neutral",
                  hex: "#F2F3F4",
                  role: "Light panels and page furniture where white would flatten the layout.",
                  on: "light",
                },
                {
                  name: "Teal tint",
                  hex: "#EDF7F5",
                  role: "Highlight fields and callouts. Use sparingly — it loses its effect when repeated.",
                  on: "light",
                },
              ]}
            />

            <Callout label="Contrast — this one is a rule">
              <p>
                Teal at brand strength reaches roughly{" "}
                <strong>2:1 against white</strong>. It is a surface and marker
                colour, not a text colour. For small teal text on a light
                background use <strong>#1F7D73</strong>, which clears 4.5:1. On
                charcoal, teal is fine as-is.
              </p>
              <p>
                The same applies to grey. The lighter secondary grey used in
                recent work (#8A9097) sits at 3.2:1 on white — acceptable for
                rules and large type, not for captions. Use{" "}
                <strong>#6E757D</strong> for small secondary text.
              </p>
            </Callout>

            <Subsection title="Typography" eyebrow="03.2">
              <p>
                Two typefaces, both already in use across the website and the
                recent proposal work. Do not add a third without a reason.
              </p>
            </Subsection>

            <TypeSpecimen
              typefaces={[
                {
                  name: "Inter",
                  role: "Primary",
                  sample: "Aa 0123",
                  notes:
                    "Everything: headings, body, labels, tables, UI. Weights 400–700. Tighten letter-spacing on large headings; open it out to roughly 0.16em on small uppercase labels.",
                },
                {
                  name: "Fraunces",
                  role: "Display",
                  sample: "Aa 0123",
                  display: true,
                  notes:
                    "Editorial accent only — cover titles, large section numerals, pull quotes. It gives documents their character. Never set body copy or anything below about 20px in it.",
                },
              ]}
            />

            <Subsection title="Structure" eyebrow="03.3">
              <p>
                The structural language matters more than the palette. Most of
                what makes Web Wizards work recognisable is grid, whitespace and
                hairlines — not colour.
              </p>
            </Subsection>

            <RuleBlock
              items={[
                {
                  title: "Build on a visible grid",
                  body: "Columns should be obvious even without gridlines. Things line up; where they do not, it should read as deliberate.",
                },
                {
                  title: "Whitespace is structure, not leftover",
                  body: "Space between blocks carries hierarchy. If a page feels tight, remove content before removing space.",
                },
                {
                  title: "Thin rules over boxes",
                  body: "A 1px rule separates as well as a border and adds far less weight. Use full boxes only when a block genuinely needs to be lifted off the page.",
                },
                {
                  title: "Small uppercase labels mark sections",
                  body: "Roughly 11px, semibold, 0.16em tracking. They are the connective tissue of the system — section markers, panel headers, metadata keys.",
                },
                {
                  title: "Numbering is quiet",
                  body: "Sections are numbered 01, 02, 03. Numerals are a navigational aid, set in grey or teal at small size — or in Fraunces at large size on a cover or divider.",
                },
                {
                  title: "Geometry is flat and simple",
                  body: "Squares, rules, bars, split fields. No gradients except the faint radial glow used behind dark covers. No drop shadows in document work.",
                },
                {
                  title: "Icons are minimal or absent",
                  body: "Single-weight line icons only, and only where an icon does work a label cannot. Most pages need none.",
                },
                {
                  title: "Imagery is controlled",
                  body: "Real photography or texture, full-bleed or cropped to the grid, at a scale that lets it hold the page. No stock illustration, no clip art, no decorative abstract renders.",
                },
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="applications"
            marker="04"
            title="Digital & Document Applications"
            intro={
              <>
                <p>
                  Web Wizards has one identity with two applications. They share
                  a palette and typeface pairing; they differ in composition,
                  density and how much editorial character they carry.
                </p>
                <p>
                  A website has to work at a glance and hold up under scrolling.
                  A document has to survive being printed, skimmed in a meeting
                  and forwarded to someone who was not in the room. Those are
                  different jobs, and the treatment should reflect that.
                </p>
              </>
            }
          >
            <ApplicationSplit
              panels={[
                {
                  label: "Application A",
                  title: "Digital experiences",
                  description:
                    "The website and anything built to be used on screen. Confident, structural, quick to scan.",
                  tone: "dark",
                  traits: [
                    "Bold sans-serif typography carrying the hierarchy",
                    "Strong, visible grid structure",
                    "Dark backgrounds used as anchors and section breaks",
                    "Photography or texture where it earns its place",
                    "Teal restricted to accents, states and markers",
                  ],
                },
                {
                  label: "Application B",
                  title: "Formal documents",
                  description:
                    "Proposals, strategies, audits and reports. Everything above, plus more editorial composition.",
                  tone: "light",
                  traits: [
                    "Display typography on covers and section pages",
                    "Dark covers and dividers against light content pages",
                    "Information-dense body pages with clear hierarchy",
                    "Abstract geometric devices — numerals, rules, split fields",
                    "More considered composition; pages are designed, not filled",
                  ],
                },
              ]}
            />

            <Callout label="The test">
              <p>
                Put a page from the website next to a page from the document. If
                a client could not tell they came from the same company, one of
                them is wrong.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="ownership"
            marker="05"
            title="Branding & Ownership Rules"
            intro={
              <>
                <p>
                  Most branding arguments are really ownership questions. Before
                  designing anything, answer one: <strong>who is this for?</strong>
                </p>
                <p>
                  Almost everything falls into one of three categories, and each
                  has a default. Follow the default unless there is a specific
                  reason not to.
                </p>
              </>
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
                    "This is our thinking, our method and our commercial position. It belongs to us and should look like it.",
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
                    "The material lives inside the client's business. It gets circulated internally, shown to their board and used to make decisions. It should feel like their document, prepared by us.",
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
                    "The audience is the client's customer, who has no relationship with us and no reason to care who made it. Our logo on this is noise at best.",
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

            <DefinitionTable
              caption="Applying the categories"
              rows={[
                {
                  term: "Category B in practice",
                  detail:
                    "Use the client's logo, their name in the title, and their brand colours where they do not fight the content. Web Wizards appears as a restrained 'Prepared by Web Wizards' line on the cover and in the footer. Our mark should be present and small — findable, not competing.",
                },
                {
                  term: "Category C in practice",
                  detail:
                    "No Web Wizards branding at all. Not in the artwork, not in the filename the client receives, not in the footer. Attribution belongs in the delivery email or the project record, not on the asset.",
                },
                {
                  term: "Genuinely unclear cases",
                  detail:
                    "Ask who will look at it and where it will end up. A strategy the client presents internally is Category B. A one-pager we hand out at a conference is Category A. A case study featuring a client is Category A with their permission.",
                },
                {
                  term: "Client brand guidelines",
                  detail:
                    "When a client has a brand guide and the work is Category B or C, their guide wins. Ask for it during onboarding rather than reverse-engineering it from their website.",
                },
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="co-branding"
            marker="06"
            title="Co-Branding"
            intro={
              <>
                <p>
                  The objective of co-branding is not equal logo prominence. It
                  is to make clear, at a glance, who a piece of work is for and
                  who produced it.
                </p>
                <p>
                  Two logos side by side at matching size says the two
                  organisations are equal partners in the material. That is
                  almost never what is true, and it reads as a joint venture
                  rather than a service relationship.
                </p>
              </>
            }
          >
            <CoBrandingExamples
              examples={[
                {
                  context: "Client-led deliverable",
                  verdict: "use",
                  lockup: "client-led",
                  note: "Client logo at full size. Web Wizards as a small 'Prepared by' mark, typically bottom-left of the cover and in the footer.",
                },
                {
                  context: "Web Wizards-owned material",
                  verdict: "use",
                  lockup: "ww-led",
                  note: "Our mark alone, at whatever size the layout calls for. No client branding unless the client is the subject.",
                },
                {
                  context: "Matched-size lockup",
                  verdict: "avoid",
                  lockup: "equal",
                  note: "Reads as a partnership or joint venture. Reserve for genuine co-authored work, which is rare.",
                },
              ]}
            />

            <RuleBlock
              items={[
                {
                  title: "One logo per surface, wherever possible",
                  body: "A cover carries the client's mark. The footer carries ours. They do not need to appear together on the same line.",
                },
                {
                  title: "Prominence follows audience",
                  body: "The brand of whoever the material is for goes first. If the audience is the client's customer, we are not on it at all.",
                },
                {
                  title: "Attribution is text, not a badge",
                  body: "'Prepared by Web Wizards' set in a small label is more confident than a second logo lockup, and it does not compete.",
                },
                {
                  title: "Never redraw a client's logo",
                  body: "Use the files they supply. If they only have a low-resolution version, ask for a better one during onboarding rather than recreating it.",
                },
                {
                  title: "Keep the page clean",
                  body: "Two brands is the ceiling. Platform logos, certification badges and partner marks scattered across a cover undo the work everything else is doing.",
                },
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="document-standards"
            marker="07"
            title="Document Standards"
            intro={
              <>
                <p>
                  A finished Web Wizards document should tell the reader what it
                  is, who it is for and when it was written, without them having
                  to ask. Everything below serves that.
                </p>
                <p>
                  This is not document control. There is no approval matrix and
                  no numbering scheme to maintain. It is the minimum a
                  professional document needs.
                </p>
              </>
            }
          >
            <DocumentAnatomy
              parts={[
                {
                  zone: "Cover",
                  requirement: "Title, audience, purpose and date",
                  detail:
                    "What the document is, who it was prepared for, and when. A one-line description of its purpose where the title does not make it obvious.",
                },
                {
                  zone: "Attribution",
                  requirement: "Prepared by, where appropriate",
                  detail:
                    "Present on Category A and B material. Absent entirely on Category C. Set as a small label, not a logo lockup.",
                },
                {
                  zone: "Contents",
                  requirement: "For anything over about eight pages",
                  detail:
                    "Numbered sections matching the section markers used through the document. Short documents do not need one.",
                },
                {
                  zone: "Hierarchy",
                  requirement: "Consistent, and no deeper than three levels",
                  detail:
                    "Section, subsection, and a heading within it. If you need a fourth level, the section probably needs splitting.",
                },
                {
                  zone: "Body",
                  requirement: "Readable density",
                  detail:
                    "One idea per page where the format allows. A page that has to be shrunk to fit is a page that needs to be two pages.",
                },
                {
                  zone: "Footer",
                  requirement: "Consistent on every page",
                  detail:
                    "Document title, page number, and client name where relevant. Same treatment throughout — including section dividers.",
                },
                {
                  zone: "Version",
                  requirement: "When it will change",
                  detail:
                    "Living documents carry a version and date. A one-off proposal does not need one; a strategy that will be revised does.",
                },
              ]}
            />

            <Callout label="Naming" tone="charcoal">
              <p>
                File names travel further than covers do. Use{" "}
                <strong>Client — Document Type — YYYY-MM</strong> for
                client-facing work, and drop the client name for internal
                material. Never send a file called{" "}
                <strong>Proposal_v3_FINAL_2.pdf</strong>.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="design-principles"
            marker="08"
            title="Design Principles"
            intro={
              <p>
                When a specific rule above does not cover the situation, these
                do.
              </p>
            }
          >
            <DoAvoid
              doItems={[
                "Build a strong hierarchy — the reader should know what to look at first",
                "Create whitespace and protect it",
                "Keep layouts disciplined and aligned to the grid",
                "Use teal selectively, as an accent rather than a theme",
                "Prioritise readability over density",
                "Apply client branding according to the ownership category",
                "Give every visual element a job",
                "Give each page or spread one clear focal point",
                "Reuse a layout that already works",
              ]}
              avoidItems={[
                "Introducing colours outside the system",
                "Overcrowding a page to avoid adding another one",
                "Icons used as decoration",
                "Graphics that illustrate nothing",
                "Generic AI-generated imagery — abstract renders, glowing networks, stock futurism",
                "Mixing type styles within a document",
                "Shrinking type or margins to make content fit",
                "Equal-weight co-branding by default",
                "Inventing a new visual style for each deliverable",
              ]}
            />

            <Callout label="The shortest version">
              <p>
                If you cannot explain why an element is on the page, take it
                off. Almost every problem with a deliverable is something that
                should have been removed rather than something missing.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="examples"
            marker="09"
            title="Approved Direction"
            intro={
              <>
                <p>
                  Two recent pieces define the current direction for formal
                  materials. They are reference points, not templates — take the
                  principles, not the layouts.
                </p>
                <p>
                  Both files sit with the Digital Marketing lead. Ask before
                  starting a significant document rather than working from
                  memory.
                </p>
              </>
            }
          >
            <ExamplePanel
              label="Reference 01 · Document"
              title="Goodies Bake Shop — Digital Marketing Proposal"
              demonstrates={[
                "The refined neutral ramp: charcoal, slate, grey, hairline rule",
                "Inter and Fraunces working together — sans for substance, serif for character",
                "Teal used as an accent across a full document without becoming a theme",
                "Editorial composition: dark section pages against light, dense content pages",
                "Fine rules carrying structure instead of boxes and shadows",
              ]}
              takeaway="This is the current benchmark for any formal Web Wizards document. When starting a proposal, strategy or audit, match this level of restraint and structure before adding anything of your own."
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
                "Overall finish and polish across a long, information-dense piece",
                "Section labels and numbered markers used consistently as navigation",
                "Structured information layouts — comparison tables, stat rows, staged diagrams",
                "Client and Web Wizards branding coexisting without competing",
                "Consistent spacing and border treatment holding a large document together",
              ]}
              takeaway="Take the information design and the discipline of the labelling system. Do not take the presentation format — sequential slide-style panels belong in a pitch, not in a strategy, report or anything built to be referred back to."
            />

            <Callout label="Adding to this list" tone="charcoal">
              <p>
                If you produce something that sets a new benchmark, say so. This
                section should grow as the work does — but only with pieces
                people can genuinely learn from, not everything that shipped.
              </p>
            </Callout>
          </Section>
        </article>

        <aside className="hidden xl:block">
          <OnThisPage items={toc} />
        </aside>
      </div>
    </div>
  );
}
