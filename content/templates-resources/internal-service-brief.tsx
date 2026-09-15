import Image from "next/image";
import {
  PageHeader,
  Section,
  RuleBlock,
  Callout,
  DefinitionTable,
  NextModules,
  SectionLabel,
} from "@/components/hub/primitives";
import { OnThisPage, type TocItem } from "@/components/hub/OnThisPage";

const PDF =
  "/templates/internal-service-brief/web-wizards-internal-service-brief-template.pdf";
const PREVIEW =
  "/templates/internal-service-brief/web-wizards-internal-service-brief-preview.png";

const toc: TocItem[] = [
  { id: "what", marker: "01", title: "What It Is" },
  { id: "template", marker: "02", title: "The Template" },
  { id: "sections", marker: "03", title: "What Goes In Each Section" },
  { id: "ai", marker: "04", title: "Producing One With AI" },
  { id: "next", marker: "05", title: "Then What?" },
];

export default function InternalServiceBriefTemplate() {
  return (
    <div className="px-6 pt-10 pb-4 md:px-12 lg:px-16 lg:pt-14">
      <PageHeader
        title="Internal Service Brief"
        lede="The salesperson's written handoff to Delivery. One page, Web Wizards branded, internal only — produced from the approved proposal before the handoff conversation."
        breadcrumb={[
          { label: "Hub", href: "/" },
          { label: "Templates & Resources", href: "/templates-resources" },
          { label: "Internal Service Brief" },
        ]}
        meta={[
          { label: "Written by", value: "Salesperson" },
          { label: "Read by", value: "Delivery team" },
          { label: "Format", value: "One-page PDF" },
          { label: "Version", value: "0.1 · Sept 2026" },
        ]}
      />

      <div className="mt-12 grid gap-12 min-[1400px]:grid-cols-[minmax(0,1fr)_var(--spacing-toc)] min-[1400px]:gap-14">
        <article className="@container min-w-0 space-y-12">
          {/* ---------------------------------------------------------------- */}
          <Section
            id="what"
            marker="01"
            title="What It Is"
            intro={
              <>
                <p>
                  The Internal Service Brief carries the context Delivery cannot
                  get from the proposal or Productive on its own — why the client
                  bought, what was promised, what to be careful about.
                </p>
                <p>
                  It is written by the salesperson, reviewed by the salesperson,
                  and read by Delivery before the handoff conversation. Delivery
                  does not co-author it.
                </p>
              </>
            }
          >
            <RuleBlock
              items={[
                {
                  title: "Start with the approved proposal",
                  body: "Add relevant sales correspondence or notes, plus your own commentary for anything the proposal does not make obvious.",
                },
                {
                  title: "Draft it with AI",
                  body: "Give it the template below and your source material. It produces the first version.",
                },
                {
                  title: "Review and correct it",
                  body: "You are accountable for what the brief says. An unreviewed draft is not a handoff.",
                },
                {
                  title: "Export a one-page PDF and attach it to Productive",
                  body: "Where Delivery will look for it. The handoff conversation follows, with the brief as the agenda.",
                },
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="template"
            marker="02"
            title="The Template"
            intro={
              <p>
                This is the reference layout and the level of detail expected.
                The example is fictional — an ordinary retained client, filled in
                the way a real one should be.
              </p>
            }
          >
            <div className="border border-rule bg-surface">
              <a
                href={PDF}
                target="_blank"
                rel="noreferrer"
                className="group block border-b border-rule bg-neutral-tint p-5"
              >
                <Image
                  src={PREVIEW}
                  alt="Completed Internal Service Brief for the fictional client Cedarline Outdoor Living, shown as a single page"
                  width={1632}
                  height={2112}
                  className="mx-auto block w-full max-w-lg border border-rule shadow-none transition-opacity group-hover:opacity-90"
                />
              </a>

              <div className="flex flex-col gap-4 px-6 py-5 @xl:flex-row @xl:items-center @xl:justify-between">
                <div>
                  <SectionLabel>Download</SectionLabel>
                  <p className="mt-2 text-[0.9375rem] leading-snug font-semibold text-charcoal">
                    Internal Service Brief — template &amp; worked example
                  </p>
                  <p className="mt-1 text-[0.875rem] text-slate">
                    One page, US Letter, PDF.
                  </p>
                </div>
                <a
                  href={PDF}
                  target="_blank"
                  rel="noreferrer"
                  className="label inline-flex shrink-0 items-center gap-3 self-start bg-charcoal px-5 py-3.5 text-white transition-colors hover:bg-teal-ink @xl:self-auto"
                >
                  Open the PDF
                  <span aria-hidden className="h-px w-6 bg-teal" />
                </a>
              </div>
            </div>

            <Callout label="Use it as the reference, not a form">
              <p>
                Do not fill in a blank copy field by field. Produce a
                client-specific brief that follows this structure and this level
                of detail. If a section has nothing worth saying for a
                particular client, cut it rather than padding it.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="sections"
            marker="03"
            title="What Goes In Each Section"
            intro={
              <p>
                Header fields first — client, service or engagement, Account
                Manager, salesperson, date — then the seven sections below.
              </p>
            }
          >
            <DefinitionTable
              rows={[
                {
                  term: "Client & key contacts",
                  detail:
                    "Company, Account Manager, assigned services. Name the primary working contact — who we deal with day to day — separately from other stakeholders or influencers: executive sponsor, owner, final approver, marketing lead. Not a contact list; only people Delivery needs to know about.",
                },
                {
                  term: "What we sold",
                  detail:
                    "Services purchased, recurring or project, fee and budget where useful, term, expected start. Do not reproduce the proposal scope.",
                },
                {
                  term: "Why they hired us",
                  detail:
                    "The actual business reason behind the engagement. Two to four bullets.",
                },
                {
                  term: "Goals & priorities",
                  detail:
                    "What the client is trying to achieve, in their words where possible. Do not invent KPIs nobody agreed to.",
                },
                {
                  term: "Important scope notes",
                  detail:
                    "Only what Delivery could miss or misread — inclusions, exclusions, assumptions, unusual requirements, timing commitments, dependencies, media budget versus management fee, and anything the client is keeping in-house.",
                },
                {
                  term: "Client context",
                  detail:
                    "Prior agency experience, known frustrations, sensitivities, decision-making dynamics, internal constraints, expectations set during the sale. Only what materially affects delivery — no gossip or personality profiling.",
                },
                {
                  term: "Immediate next steps",
                  detail:
                    "Three to five concrete actions with an owner: Productive setup, access requests, asset collection, baseline review, kickoff scheduling.",
                },
              ]}
            />

            <Callout label="Leave it out" tone="charcoal">
              <p>
                No full proposal, no service descriptions, no client history, no
                discovery notes, and nothing already visible in Productive —
                tasks, budgets, owners and project data live there and stay
                there. The brief carries context; Productive stays the system of
                record. If AI has asserted something you cannot verify, delete
                it.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="ai"
            marker="04"
            title="Producing One With AI"
            intro={
              <p>
                Five to ten minutes for a normal account. Give the model the
                template and the source material, then check what comes back.
              </p>
            }
          >
            <DefinitionTable
              rows={[
                {
                  term: "What to supply",
                  detail:
                    "The PDF above as the layout and tone reference, the approved proposal, any sales correspondence that carries context, and your own notes on what the proposal does not say.",
                },
                {
                  term: "What to ask for",
                  detail:
                    "A one-page Internal Service Brief following the attached template, using only the supplied material. Tell it to leave a section short rather than filling it with inference.",
                },
                {
                  term: "What to check",
                  detail:
                    "Names, figures, dates and commitments against the proposal. Anything the model inferred rather than read. Whether it still fits on one page.",
                },
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="next"
            marker="05"
            title="Then What?"
            intro={
              <p>
                The brief is step two of onboarding. The handoff process around
                it is in Client Onboarding.
              </p>
            }
          >
            <NextModules
              targets={[
                { section: "client-onboarding", entry: "internal-handoff" },
                { section: "client-onboarding", entry: "overview" },
                { section: "client-onboarding", entry: "productive-setup" },
                {
                  section: "standards",
                  entry: "brand-document-deliverable-standards",
                },
              ]}
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
