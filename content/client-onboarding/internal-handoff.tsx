import {
  PageHeader,
  Section,
  Subsection,
  RuleBlock,
  Callout,
  Checklist,
  DefinitionTable,
  NextModules,
} from "@/components/hub/primitives";
import { OnThisPage, type TocItem } from "@/components/hub/OnThisPage";

const toc: TocItem[] = [
  { id: "roles", marker: "01", title: "Who Owns What" },
  { id: "brief", marker: "02", title: "The Internal Service Brief" },
  { id: "conversation", marker: "03", title: "The Handoff Conversation" },
  { id: "done", marker: "04", title: "Handoff Is Complete When" },
  { id: "next", marker: "05", title: "Then What?" },
];

export default function InternalHandoff() {
  return (
    <div className="px-6 pt-10 pb-4 md:px-12 lg:px-16 lg:pt-14">
      <PageHeader
        title="Internal Handoff"
        lede="Sales moves the context Delivery cannot get from the proposal on its own. One short brief, one short conversation, then onboarding carries on."
        breadcrumb={[
          { label: "Hub", href: "/" },
          { label: "Client Onboarding", href: "/client-onboarding" },
          { label: "Internal Handoff" },
        ]}
        meta={[
          { label: "Owned by", value: "Account Manager" },
          { label: "Context from", value: "Salesperson" },
          { label: "Output", value: "Internal Service Brief" },
          { label: "Version", value: "0.1 · Sept 2026" },
        ]}
      />

      <div className="mt-12 grid gap-12 min-[1400px]:grid-cols-[minmax(0,1fr)_var(--spacing-toc)] min-[1400px]:gap-14">
        <article className="@container min-w-0 space-y-12">
          {/* ---------------------------------------------------------------- */}
          <Section
            id="roles"
            marker="01"
            title="Who Owns What"
            intro={
              <p>
                Three roles, and they are not interchangeable. The salesperson
                supplies the context; the Account Manager owns getting it across
                the line.
              </p>
            }
          >
            <DefinitionTable
              rows={[
                {
                  term: "Salesperson",
                  detail:
                    "Provides the sales context — what was sold, what was promised, what the client actually wants. Reviews and corrects the Internal Service Brief. Their part ends at the handoff; they do not run the rest of onboarding.",
                },
                {
                  term: "Account Manager",
                  detail:
                    "Owns the handoff. Makes sure the brief exists, has been reviewed and is attached to the project, and confirms the delivery team has what it needs before onboarding moves on.",
                },
                {
                  term: "Service specialist",
                  detail:
                    "Reads the brief, asks questions, flags gaps and confirms understanding at the handoff conversation. If something is unclear or missing, say so then — not three weeks into delivery.",
                },
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="brief"
            marker="02"
            title="The Internal Service Brief"
            intro={
              <>
                <p>
                  The Internal Service Brief is the salesperson&rsquo;s written
                  handoff to Delivery. It is produced{" "}
                  <strong>before the handoff conversation</strong>, from the
                  approved proposal plus relevant sales context and
                  correspondence.
                </p>
                <p>
                  One page. Do not write it from scratch — most of what it needs
                  is already in the proposal. Delivery reads it, asks questions
                  and flags gaps; Delivery does not co-author it.
                </p>
              </>
            }
          >
            <RuleBlock
              items={[
                {
                  title: "Start from the approved proposal",
                  body: "Add any sales correspondence or notes that carry context the proposal does not.",
                },
                {
                  title: "Salesperson adds commentary",
                  body: "Anything a reader would not pick up from the proposal itself — what the client really wants, what was said verbally, what to be careful about.",
                },
                {
                  title: "AI drafts the brief",
                  body: "Give it the proposal and the commentary; it produces the first version.",
                },
                {
                  title: "Salesperson reviews and corrects",
                  body: "A human signs off before anyone else reads it. An unreviewed draft is not a handoff.",
                },
                {
                  title: "Attach it to the Productive project",
                  body: "Where the delivery team will look for it. Onboarding carries a task for creating and reviewing the brief, and the Account Manager confirms it is done.",
                },
              ]}
            />

            <Subsection title="What goes in it" eyebrow="02.1">
              <p>
                Six short sections. If any of them runs long, it probably
                belongs somewhere else.
              </p>
            </Subsection>

            <DefinitionTable
              rows={[
                {
                  term: "Client & key contacts",
                  detail:
                    "Company, Account Manager, and the assigned service or services. Name the primary working contact — who we deal with day to day — separately from other important stakeholders or influencers: executive sponsor, owner, final approver, marketing lead, anyone with real influence over the engagement.",
                },
                {
                  term: "What we sold",
                  detail:
                    "Services purchased, fee or budget where useful, term or project basis, expected start.",
                },
                {
                  term: "Goals & priorities",
                  detail:
                    "What the client is trying to achieve, in plain language.",
                },
                {
                  term: "Important scope notes",
                  detail:
                    "Inclusions, exclusions, unusual requirements, timing commitments, assumptions.",
                },
                {
                  term: "Why they hired us / client context",
                  detail:
                    "The problem or opportunity behind the engagement, plus the context around it — prior agency or vendor experience, known frustrations, sensitivities, decision-making dynamics, internal constraints, and expectations created during the sale. Only what materially affects delivery — not personal commentary.",
                },
                {
                  term: "Immediate next steps",
                  detail: "What has to happen right after the handoff.",
                },
              ]}
            />

            <Callout label="What the brief is not">
              <p>
                Do not retype the proposal, rebuild information that is already
                in Productive, or write a client history. The brief carries the
                context Delivery cannot get from those places and nothing else.
                If it has run past a page, it has stopped being a handoff and
                started being paperwork.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="conversation"
            marker="03"
            title="The Handoff Conversation"
            intro={
              <p>
                A short internal conversation normally follows once the brief is
                written and reviewed, with the brief as the agenda. Around 15–20
                minutes for a typical account. Small or simple work may not need
                one at all if the brief plus a direct follow-up covers it.
              </p>
            }
          >
            <DefinitionTable
              rows={[
                {
                  term: "Who attends",
                  detail:
                    "Salesperson, Account Manager, assigned specialist, and service lead where relevant.",
                },
                {
                  term: "What to cover",
                  detail:
                    "Why the client bought, what was promised, what matters most to them, risks and sensitivities, open questions, immediate next steps, and who owns what.",
                },
                {
                  term: "What not to prepare",
                  detail:
                    "No agenda document and no deck. The brief is the agenda.",
                },
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="done"
            marker="04"
            title="Handoff Is Complete When"
            intro={
              <p>
                The Account Manager confirms this before onboarding moves on.
              </p>
            }
          >
            <Checklist
              items={[
                "The Internal Service Brief is written, reviewed by the salesperson and attached to the project",
                "The delivery team understands what was sold",
                "Goals and priorities are understood",
                "Risks, sensitivities and unusual commitments are known",
                "Outstanding questions have an owner",
                "Immediate next steps are clear",
              ]}
            />

            <Callout label="Keep it lightweight">
              <p>
                <strong>The handoff should take minutes, not hours.</strong> Its
                only job is to move the context Delivery cannot get from the
                proposal or Productive on its own. The brief is not a substitute
                for the Account Manager and the specialist actually
                understanding the account — if it is generating work rather than
                saving it, something has gone wrong.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="next"
            marker="05"
            title="Then What?"
            intro={
              <p>
                Handoff feeds straight into Productive setup and the access
                request. The brief template lives in Templates &amp; Resources.
              </p>
            }
          >
            <NextModules
              targets={[
                { section: "client-onboarding", entry: "overview" },
                { section: "client-onboarding", entry: "productive-setup" },
                { section: "client-onboarding", entry: "access-assets" },
                { section: "client-onboarding", entry: "client-kickoff" },
                {
                  section: "templates-resources",
                  entry: "internal-service-brief",
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
