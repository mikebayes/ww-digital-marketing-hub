import Link from "next/link";
import {
  PageHeader,
  Section,
  SectionLabel,
  Subsection,
  RuleBlock,
  Callout,
  Checklist,
  DefinitionTable,
  NextModules,
} from "@/components/hub/primitives";
import { Screenshot } from "@/components/hub/Screenshot";
import { OnThisPage, type TocItem } from "@/components/hub/OnThisPage";

const toc: TocItem[] = [
  { id: "glance", marker: "01", title: "Onboarding at a Glance" },
  { id: "roles", marker: "02", title: "Who Owns What" },
  { id: "productive", marker: "03", title: "Set Up the Project" },
  { id: "budget", marker: "04", title: "Add the Budget" },
  { id: "tasks", marker: "05", title: "Task Dates & Recurrence" },
  { id: "handoff", marker: "06", title: "Internal Handoff" },
  { id: "intake", marker: "07", title: "Client Intake & Kickoff" },
  { id: "access", marker: "08", title: "Access & Assets" },
  { id: "strategy", marker: "09", title: "Strategy" },
  { id: "calendar", marker: "10", title: "First Content Calendar" },
  { id: "service", marker: "11", title: "Confirm the Service" },
  { id: "account", marker: "12", title: "Understand the Account" },
  { id: "content-model", marker: "13", title: "The Content Model" },
  { id: "horizon", marker: "14", title: "Content Planning Horizon" },
  { id: "approval", marker: "15", title: "Approval & Community" },
  { id: "rhythm", marker: "16", title: "Ongoing Delivery Rhythm" },
  { id: "done", marker: "17", title: "Complete When" },
  { id: "next", marker: "18", title: "Then What?" },
];

const IMG = "/productive/social-media";

/** The eleven steps, in order, with the person who owns each one. */
const STEPS: { title: string; owner: string }[] = [
  { title: "Complete Internal Service Brief", owner: "Salesperson" },
  { title: "Complete Internal Handoff Meeting", owner: "Account Manager" },
  { title: "Prepare Client Intake Questionnaire", owner: "Account Manager" },
  {
    title: "Send Client Onboarding Email & Intake Questionnaire",
    owner: "Account Manager",
  },
  {
    title: "Review Client Intake Questionnaire & Prepare for Kickoff",
    owner: "Account Manager + Social Content Lead",
  },
  { title: "Complete Client Kickoff Meeting", owner: "Account Manager" },
  { title: "Confirm Social Access & Assets", owner: "Account Manager" },
  {
    title: "Conduct Social Media Strategy Session(s)",
    owner: "Social Content Lead",
  },
  {
    title: "Create Client Social Media Strategy",
    owner: "Social Content Lead",
  },
  {
    title: "Present Strategy & Obtain Client Approval",
    owner: "Account Manager + Social Content Lead",
  },
  {
    title: "Prepare First Monthly Content Calendar",
    owner: "Social Content Lead",
  },
];

/**
 * The whole process on one screen.
 *
 * A numbered list with the owner on the same row: the two questions someone
 * arrives with are "what comes next" and "is that mine", and both should be
 * answerable without reading a paragraph.
 */
function AtAGlance() {
  return (
    <ol className="border-t border-rule">
      {STEPS.map((step, index) => (
        <li key={step.title} className="border-b border-rule">
          <div className="grid gap-x-8 gap-y-1 py-3.5 @2xl:grid-cols-[2.5rem_minmax(0,1fr)_minmax(0,15rem)] @2xl:items-baseline">
            <span aria-hidden className="label tabular-nums text-teal-ink">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-[0.9375rem] leading-snug font-medium text-charcoal">
              {step.title}
            </span>
            <span className="label text-muted">{step.owner}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Divider between the procedure and the standards behind it. */
function PartDivider({ label, title }: { label: string; title: string }) {
  return (
    <div className="border-t-2 border-charcoal pt-7">
      <SectionLabel tone="muted">{label}</SectionLabel>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-slate">{title}</p>
    </div>
  );
}

export default function SocialMediaOnboarding() {
  return (
    <div className="px-6 pt-10 pb-4 md:px-12 lg:px-16 lg:pt-14">
      <PageHeader
        title="Social Media"
        lede="What has to be established before an organic social engagement moves into normal delivery. Paid social is onboarded under Paid Media, even when it runs on Meta."
        breadcrumb={[
          { label: "Hub", href: "/" },
          { label: "Service Onboarding", href: "/service-onboarding" },
          { label: "Social Media" },
        ]}
        meta={[
          { label: "Owned by", value: "Account Manager" },
          { label: "Content owner", value: "Social Content Lead" },
          { label: "Scope", value: "Organic social" },
          { label: "Version", value: "0.2 · Sept 2026" },
        ]}
      />

      <div className="mt-12 grid gap-12 min-[1400px]:grid-cols-[minmax(0,1fr)_var(--spacing-toc)] min-[1400px]:gap-14">
        <article className="@container min-w-0 space-y-12">
          {/* ================================================================ */}
          {/* Part A — run the onboarding                                      */}
          {/* ================================================================ */}

          <Section
            id="glance"
            marker="01"
            title="Onboarding at a Glance"
            intro={
              <p>
                Eleven steps from a signed proposal to a first content calendar.
                Roughly three to four weeks for a normal account. Each step is
                written out later on this page.
              </p>
            }
          >
            <AtAGlance />

            <Callout label="Two things run in parallel">
              <p>
                Setting the client up in Productive is not on this list because
                it is not a client-facing step. Do it as soon as the handoff is
                done, so the project and budget exist before the first invoice
                is due. Sections <strong>03</strong> to <strong>05</strong>
                {" "}cover it.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="roles"
            marker="02"
            title="Who Owns What"
            intro={
              <p>
                Onboarding stalls when nobody is sure whose turn it is. Each row
                is one person&rsquo;s job for the whole engagement, not just for
                one step.
              </p>
            }
          >
            <DefinitionTable
              rows={[
                {
                  term: "Salesperson",
                  detail:
                    "Transfers what was sold, why the client bought it, the commitments made and the sales context Delivery would not otherwise know, into the Internal Service Brief and the handoff.",
                },
                {
                  term: "Account Manager",
                  detail:
                    "Owns the onboarding process and client coordination. Keeps it moving, sends the onboarding email and intake questionnaire, schedules the meetings, coordinates access and assets, and tracks what is still outstanding.",
                },
                {
                  term: "Social Content Lead",
                  detail:
                    "Owns the social strategy and content approach: audiences, messaging, pillars, creative and content direction, planning, the Client Social Media Strategy and the first content cycle.",
                },
                {
                  term: "Digital Marketing Manager / Platform Lead",
                  detail:
                    "Expert, platform and infrastructure support where it helps — Meta business structure, tracking, the handoff into Paid Media. Not a routine attendee and not an owner of routine onboarding.",
                },
                {
                  term: "Client",
                  detail:
                    "Information only they can reasonably provide, access and assets they control, subject-matter input, and approvals.",
                },
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="productive"
            marker="03"
            title="Set Up the Project in Productive"
            intro={
              <p>
                Do this once the internal handoff is complete. The template
                carries the standard task structure, so almost nothing has to be
                built by hand.
              </p>
            }
          >
            <Subsection title="Create the project" eyebrow="03.1">
              <p>
                From the client account, open <strong>Projects</strong> and
                choose <strong>+ Project</strong>.
              </p>
              <div className="mt-4">
                <Screenshot
                  src={`${IMG}/01-new-project.png`}
                  alt="The + Project button in Productive"
                  width={97}
                  height={36}
                  inline
                />
              </div>
              <p className="mt-5">
                Choose <strong>Create from template</strong> and select{" "}
                <strong>Social Media Retainer Project Template</strong>.
              </p>
              <div className="mt-4">
                <Screenshot
                  src={`${IMG}/02-create-from-template.png`}
                  alt="Step 1 of the Productive project wizard, with Create from template selected and the Social Media Retainer Project Template chosen"
                  width={741}
                  height={663}
                />
              </div>
            </Subsection>

            <Subsection title="Name and configure it" eyebrow="03.2">
              <p>
                Name the live project{" "}
                <strong>Client Name &ndash; Social Media Management</strong>.
                For example, <em>All Weather at Home &ndash; Social Media
                Management</em>. The words &ldquo;Template&rdquo; and
                &ldquo;Retainer Project Template&rdquo; do not belong in a live
                project name.
              </p>
              <p>
                Set the <strong>Client</strong> to the actual client and the{" "}
                <strong>Project manager</strong> to the Account Manager. When
                Productive asks what to include from the template, choose{" "}
                <strong>Everything</strong>.
              </p>
              <div className="mt-4">
                <Screenshot
                  src={`${IMG}/03-project-details.png`}
                  alt="Step 2 of the wizard: project name, client, project manager, and the option to include everything from the template"
                  width={723}
                  height={677}
                  caption="The name shown here is the template's placeholder. Replace it."
                />
              </div>
            </Subsection>

            <Subsection title="Map the project roles" eyebrow="03.3">
              <p>
                The template uses role placeholders rather than names. Map each
                one to the person actually doing the work:
              </p>
              <DefinitionTable
                rows={[
                  {
                    term: "Social Content Lead",
                    detail: "The assigned Social Media Specialist.",
                  },
                  {
                    term: "Account Manager",
                    detail: "The assigned Account Manager.",
                  },
                  {
                    term: "Salesperson",
                    detail: "Whoever sold the engagement.",
                  },
                ]}
              />
              <div className="mt-4">
                <Screenshot
                  src={`${IMG}/04-people-and-dates.png`}
                  alt="Step 3 of the wizard, mapping the Social Content Lead, Account Manager and Salesperson placeholders to real people"
                  width={790}
                  height={732}
                />
              </div>
              <Callout label="No dates come with the template">
                <p>
                  The template deliberately carries no due dates, because client
                  start dates vary. You set them after the project exists —
                  section <strong>05</strong>.
                </p>
              </Callout>
            </Subsection>

            <Subsection title="Confirm who is on the project" eyebrow="03.4">
              <p>
                The people you mapped should appear automatically. Review the
                list and add anyone else only where there is a real reason for
                them to have access to this client&rsquo;s work. Do not add the
                whole Digital Marketing team by default.
              </p>
              <div className="mt-4">
                <Screenshot
                  src={`${IMG}/05-invite-people.png`}
                  alt="Step 4 of the wizard, showing the people already added to the project"
                  width={720}
                  height={610}
                />
              </div>
            </Subsection>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="budget"
            marker="04"
            title="Add and Configure the Budget"
            intro={
              <p>
                The budget is part of the same wizard, but it is not finished
                when the wizard ends. Two things have to be corrected afterwards,
                and both are easy to miss.
              </p>
            }
          >
            <Subsection title="Create the budget from the template" eyebrow="04.1">
              <p>
                When Productive asks for budget data, choose{" "}
                <strong>Create from template</strong> and select{" "}
                <strong>Social Media Management Retainer</strong>.
              </p>
              <div className="mt-4">
                <Screenshot
                  src={`${IMG}/06-budget-from-template.png`}
                  alt="Step 5 of the wizard, with Create from template selected and the Social Media Management Retainer budget template chosen"
                  width={748}
                  height={755}
                />
              </div>
              <p className="mt-5">
                On the next screen, confirm the currency, confirm the{" "}
                <strong>Web Wizards Inc.</strong> subsidiary, set the Account
                Manager as budget owner, and use the actual service start date
                where it applies. Then create the project.
              </p>
              <div className="mt-4">
                <Screenshot
                  src={`${IMG}/07-budget-details.png`}
                  alt="Step 6 of the wizard: budget name, currency, budget date, subsidiary, owner and document template, with the Create project button"
                  width={833}
                  height={846}
                />
              </div>
            </Subsection>

            <Subsection title="Replace the template amount" eyebrow="04.2">
              <p>
                Open the budget and choose <strong>Edit</strong>. Replace the
                template amount with the actual monthly Social Media fee from
                the approved proposal.
              </p>
              <div className="mt-4">
                <Screenshot
                  src={`${IMG}/08-budget-edit.webp`}
                  alt="The budget service line showing the template amount of $3,000.00, with the Edit button at the top right"
                  width={2000}
                  height={295}
                  caption="$3,000.00 is the template's placeholder figure, not a standard price."
                />
              </div>
              <Callout label="The live budget must match the proposal">
                <p>
                  <strong>
                    Do not leave the template amount in place.
                  </strong>{" "}
                  It will invoice the client the wrong figure every month until
                  somebody notices.
                </p>
              </Callout>
            </Subsection>

            <Subsection title="Make the budget recurring" eyebrow="04.3">
              <p>
                Open the budget&rsquo;s <strong>Recurring</strong> tab and
                choose <strong>Create a recurring budget</strong>.
              </p>
              <div className="mt-4">
                <Screenshot
                  src={`${IMG}/09-budget-not-recurring.webp`}
                  alt="The Recurring tab of a budget showing the message This budget is not recurring and a Create a recurring budget button"
                  width={2000}
                  height={480}
                />
              </div>
              <DefinitionTable
                caption="Settings"
                rows={[
                  { term: "Recurring interval", detail: "Monthly." },
                  {
                    term: "Next occurrence",
                    detail: "The first day of the next month.",
                  },
                  {
                    term: "Stops recurring on",
                    detail:
                      "Leave blank unless the agreement has a defined end date.",
                  },
                  {
                    term: "Create invoices automatically",
                    detail: "On.",
                  },
                  {
                    term: "Everything else",
                    detail:
                      "Leave off unless there is a specific client reason to use it.",
                  },
                ]}
              />
              <div className="mt-4">
                <Screenshot
                  src={`${IMG}/10-recurring-settings.png`}
                  alt="The Create a recurring budget dialog set to Monthly, with a next occurrence of 1 Oct 2026 and Create invoices automatically ticked"
                  width={700}
                  height={526}
                />
              </div>
              <p className="mt-5">
                Then choose <strong>Make recurring</strong>.
              </p>
              <Callout label="Budget templates do not carry recurrence">
                <p>
                  A budget created from a template arrives{" "}
                  <strong>not recurring</strong>, every time. Recurrence has to
                  be set by hand on every recurring Social Media retainer, after
                  the project is created. Miss it and the retainer simply stops
                  invoicing after the first month.
                </p>
              </Callout>
            </Subsection>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="tasks"
            marker="05"
            title="Set Task Dates and Recurrence"
            intro={
              <p>
                The template contains the tasks but no dates. The Account
                Manager sets the first due dates and the recurring schedules
                once the live project exists.
              </p>
            }
          >
            <p className="text-[0.9375rem] leading-relaxed text-slate">
              Choose dates from the actual client start date, the onboarding
              timeline, the reporting commitment in the proposal and the content
              production cycle. There is no standard first due date, because
              there is no standard start date.
            </p>

            <DefinitionTable
              caption="Recurring tasks and their cadence"
              rows={[
                {
                  term: "Prepare Monthly Content Calendar",
                  detail: "Monthly.",
                },
                {
                  term: "Create & Publish Monthly Social Content",
                  detail: "Monthly.",
                },
                {
                  term: "Review Performance & Prepare Social Media Report",
                  detail:
                    "On the reporting cadence agreed in the proposal, which is not monthly for every client.",
                },
                {
                  term: "Prepare & Conduct Quarterly Business Review",
                  detail: "Every three months.",
                },
                {
                  term: "Refresh Annual Content Roadmap",
                  detail: "Annually.",
                },
              ]}
            />

            <Callout label="Community management is not a default task">
              <p>
                It is only in scope for some accounts. Add a community
                management task when the proposal includes it, and not
                otherwise.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="handoff"
            marker="06"
            title="Complete the Internal Handoff"
            intro={
              <p>
                Social starts from the proposal and the{" "}
                <Link href="/templates-resources/internal-service-brief">
                  Internal Service Brief
                </Link>
                , not from a conversation with the client. The{" "}
                <Link href="/client-onboarding/internal-handoff">
                  Internal Handoff
                </Link>{" "}
                standard covers how the meeting runs.
              </p>
            }
          >
            <Checklist
              caption="Delivery should leave the handoff knowing"
              items={[
                "What was sold",
                "Which channels are included",
                "Posting cadence",
                "The client's goals",
                "Who is responsible for content",
                "The reporting commitment",
                "Whether community management is in scope",
                "Whether Paid Media is also included",
                "Any unusual commitments or client context",
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="intake"
            marker="07"
            title="Client Intake & Kickoff"
            intro={
              <p>
                The first client-facing stage. The Account Manager sends the
                onboarding email and the intake questionnaire, then runs a
                kickoff that fills the gaps rather than starting from nothing.
              </p>
            }
          >
            <Subsection title="Send the onboarding email" eyebrow="07.1">
              <p>
                Once the handoff is done, the Account Manager sends the
                onboarding email with the Client Intake Questionnaire. Use the{" "}
                <Link href="/templates-resources/client-onboarding-email">
                  Client Onboarding Email
                </Link>{" "}
                template. It should introduce the Account Manager and the
                delivery process, say what happens next, provide the
                questionnaire and set out the timeline below.
              </p>

              <DefinitionTable
                caption="The timeline we give the client"
                rows={[
                  {
                    term: "Week 1 — Get set up",
                    detail:
                      "Team introduction, Client Intake Questionnaire and initial preparation.",
                  },
                  {
                    term: "Week 2 — Understand and plan",
                    detail: "Client kickoff and Social Media Strategy Session.",
                  },
                  {
                    term: "Week 3 — Develop and approve strategy",
                    detail:
                      "Web Wizards develops the Client Social Media Strategy and reviews it with the client.",
                  },
                  {
                    term: "Week 4 — Prepare to launch",
                    detail:
                      "The first Monthly Content Calendar is created and prepared for approval and production.",
                  },
                ]}
              />

              <p className="text-[0.9375rem] leading-relaxed text-slate">
                Most Social Media onboarding takes roughly three to four weeks,
                depending on account complexity, access and client availability.
                It is a shape, not a service level agreement.
              </p>
            </Subsection>

            <Subsection title="Read before you ask" eyebrow="07.2">
              <Callout label="Do not ask twice">
                <p>
                  Read the approved proposal, the Internal Service Brief, the
                  returned Client Intake Questionnaire, the client&rsquo;s
                  current channels, existing brand guidance and whatever was
                  collected during{" "}
                  <Link href="/client-onboarding/overview">
                    Client Onboarding
                  </Link>{" "}
                  before asking the client anything. Every question we ask twice
                  costs us credibility we could have spent elsewhere.
                </p>
              </Callout>
            </Subsection>

            <Subsection title="Run the kickoff" eyebrow="07.3">
              <p>
                The kickoff is deliberately lightweight, and is often the first
                time the client meets the delivery team. The{" "}
                <Link href="/client-onboarding/client-kickoff">
                  Client Kickoff
                </Link>{" "}
                standard covers how to run it.
              </p>
              <Checklist
                items={[
                  "Introductions",
                  "Review the questionnaire together",
                  "Fill the gaps it left",
                  "Confirm or clarify the important answers",
                  "Explain the stages that follow",
                  "Identify the access and assets we will need",
                  "Confirm client contacts and the approval structure",
                ]}
              />
              <Callout label="Not the strategy workshop">
                <p>
                  The kickoff confirms the relationship and the information. The
                  thinking happens in the Strategy Session, which is a separate
                  meeting — section <strong>09</strong>.
                </p>
              </Callout>
            </Subsection>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="access"
            marker="08"
            title="Confirm Social Access & Assets"
            intro={
              <p>
                After the kickoff, once we know what the account actually needs.
                The general process is in{" "}
                <Link href="/client-onboarding/access-assets">
                  Access &amp; Assets
                </Link>
                ; only the social-specific list belongs here, and only for the
                channels actually scoped.
              </p>
            }
          >
            <DefinitionTable
              rows={[
                {
                  term: "Channels",
                  detail:
                    "Facebook Page and Instagram, plus the Meta business account or asset structure behind them. LinkedIn Company Page, TikTok or YouTube where scoped.",
                },
                {
                  term: "Measurement",
                  detail:
                    "GA4 where social traffic is reported on, and any social analytics or reporting the client already runs.",
                },
                {
                  term: "Assets",
                  detail:
                    "Brand guidelines, photography, video, creative assets, product information and whatever else the content will be built from. Website or CMS access is not needed by default — ask only if the scope requires it.",
                },
              ]}
            />

            <p className="text-[0.9375rem] leading-relaxed text-slate">
              The <strong className="font-semibold text-charcoal">
                Social Content Lead
              </strong>{" "}
              verifies that the access actually works. Granted is not the same
              as working, and finding out in week four is expensive.
            </p>

            <Callout label="We do not collect passwords">
              <p>
                Use delegated platform access wherever it exists — that is what
                Meta Business, LinkedIn and Google all provide. Never ask for a
                password in the intake questionnaire. If shared credentials are
                genuinely unavoidable, arrange that separately through the
                current approved Web Wizards method rather than inventing one
                here.
              </p>
            </Callout>

            <Subsection title="Record the baseline" eyebrow="08.1">
              <p>
                Once access works, record where the account started: followers,
                recent reach or impressions, engagement, recent posting
                frequency, and social traffic where it is useful. Captured once,
                so that in six months there is something to compare against.
                Reporting standards are set separately.
              </p>
            </Subsection>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="strategy"
            marker="09"
            title="Strategy"
            intro={
              <p>
                The kickoff confirmed the relationship and the facts. This stage
                develops the thinking needed to actually run the account, and
                ends with the client agreeing to it.
              </p>
            }
          >
            <Subsection title="Social Media Strategy Session(s)" eyebrow="09.1">
              <p>
                A separate meeting from the kickoff, led by the Social Content
                Lead. One session is enough for a straightforward account; a
                larger or more complex engagement may need more than one.
              </p>
              <Checklist
                caption="Topics, as they apply"
                items={[
                  "Business priorities",
                  "Priority products and services",
                  "Audiences and what motivates them",
                  "Differentiators and core messages",
                  "Content pillars and creative direction",
                  "Content sources",
                  "Major campaigns, events and seasonality",
                  "Topics or claims to avoid, and brand constraints",
                  "Approvals and community management expectations",
                ]}
              />
              <p className="text-[0.9375rem] leading-relaxed text-slate">
                The output of this stage is everything needed to write the
                Client Social Media Strategy.
              </p>
            </Subsection>

            <Subsection title="Create the Client Social Media Strategy" eyebrow="09.2">
              <p>
                The core strategic reference for the engagement. It holds the
                durable information someone needs to understand how this account
                should be run — useful and practical, not a strategy deck.
              </p>
              <DefinitionTable
                caption="What it contains"
                rows={[
                  {
                    term: "Account setup",
                    detail:
                      "Channels, posting cadence, the organic and paid relationship, community-management scope.",
                  },
                  {
                    term: "Business direction",
                    detail:
                      "Objectives, priority audiences, priority products and services, geographic focus where relevant.",
                  },
                  {
                    term: "Messaging",
                    detail:
                      "Differentiators, core messages, and topics or claims to avoid.",
                  },
                  {
                    term: "Content strategy",
                    detail:
                      "Three to five content pillars, creative and content direction, preferred formats, content sources, and opportunities to feature staff, customers or projects.",
                  },
                  {
                    term: "Planning context",
                    detail:
                      "Major seasonal periods, known campaigns, events and broad annual direction.",
                  },
                  {
                    term: "Working model",
                    detail:
                      "Approval process, important client contacts, escalation rules, and links to working assets.",
                  },
                ]}
              />
              <p className="text-[0.9375rem] leading-relaxed text-slate">
                A one-page template for it exists in Templates &amp; Resources.
                It is still published there under its previous name,{" "}
                <Link href="/templates-resources/social-media-account-guide">
                  Social Media Account Guide
                </Link>
                , until the rename is made across the Hub. It is the same
                artifact.
              </p>
              <p className="text-[0.9375rem] leading-relaxed text-slate">
                <strong className="font-semibold text-charcoal">
                  Client Social Media Strategy
                </strong>{" "}
                = durable account knowledge.{" "}
                <strong className="font-semibold text-charcoal">
                  Content roadmap and calendar
                </strong>{" "}
                = the changing delivery plan.{" "}
                <strong className="font-semibold text-charcoal">
                  Productive tasks
                </strong>{" "}
                = work that needs to happen.
              </p>
            </Subsection>

            <Subsection title="Present it and get approval" eyebrow="09.3">
              <p>
                Once drafted, present the strategy to the client. This is the
                point at which we find out whether we understood them, and it is
                cheaper to find out now than in the third month of content.
              </p>
              <Checklist
                items={[
                  "Confirm we understood the client correctly",
                  "Review audiences, messages and content pillars",
                  "Confirm the content and creative direction",
                  "Identify what needs to change",
                  "Resolve disagreements and misunderstandings",
                  "Obtain client approval before detailed content production begins",
                ]}
              />
            </Subsection>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="calendar"
            marker="10"
            title="Prepare the First Monthly Content Calendar"
            intro={
              <p>
                Once the strategy is approved, the Social Content Lead builds
                the first calendar.
              </p>
            }
          >
            <Checklist
              caption="For each piece of content, where it applies"
              items={[
                "Channel",
                "Intended publish timing",
                "The post or content concept",
                "Creative requirements",
                "Approval status",
              ]}
            />

            <Callout label="Start from the strategy">
              <p>
                <strong>
                  Detailed content production begins from the approved Client
                  Social Media Strategy, not from a blank page.
                </strong>{" "}
                If the calendar is being invented from scratch, the strategy
                stage did not do its job.
              </p>
            </Callout>
          </Section>

          {/* ================================================================ */}
          {/* Part B — the standards behind the procedure                      */}
          {/* ================================================================ */}

          <PartDivider
            label="The standards behind it"
            title="The sections above are the order of work. These are the judgements that sit underneath it — what to confirm, what to understand, and how the account is run once it is live."
          />

          {/* ---------------------------------------------------------------- */}
          <Section
            id="service"
            marker="11"
            title="Confirm the Service"
            intro={
              <p>
                Start from the proposal and the{" "}
                <Link href="/templates-resources/internal-service-brief">
                  Internal Service Brief
                </Link>
                . Confirm what was actually sold before planning anything — not
                every client gets every platform.
              </p>
            }
          >
            <DefinitionTable
              rows={[
                {
                  term: "Channels",
                  detail:
                    "Which platforms and the posting frequency for each. Facebook and Instagram are the usual pair, LinkedIn is common, TikTok and YouTube only where scoped.",
                },
                {
                  term: "Content types",
                  detail:
                    "What is included, and who is responsible for copy, design, and photo or video.",
                },
                {
                  term: "Content supply",
                  detail:
                    "Whether the client supplies material, Web Wizards creates it, or both.",
                },
                {
                  term: "Community management",
                  detail: "Included or not. Do not assume it is.",
                },
                {
                  term: "Reporting",
                  detail: "Cadence, taken from the proposal.",
                },
                {
                  term: "Paid media",
                  detail: "Whether paid is also part of the engagement.",
                },
              ]}
            />

            <Callout label="Paid social is not onboarded here">
              <p>
                Paid social runs through{" "}
                <Link href="/service-onboarding/paid-media">Paid Media</Link>,
                even when it sits on Meta. Where both are live, Social and Paid
                Media coordinate creative, offers, audiences and timing — but ad
                account setup does not happen here.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="account"
            marker="12"
            title="Understand the Account"
            intro={
              <p>
                Only what is needed to run the social program. Everything else
                should already be on file. What is established here feeds the
                Client Social Media Strategy.
              </p>
            }
          >
            <DefinitionTable
              rows={[
                {
                  term: "Priorities",
                  detail:
                    "Priority audiences and products, and what the business is pushing right now.",
                },
                {
                  term: "Messages",
                  detail: "Topics to emphasise, and anything to stay away from.",
                },
                {
                  term: "Dates",
                  detail:
                    "Promotions, events and seasonal peaks content has to line up with.",
                },
                {
                  term: "References",
                  detail:
                    "Accounts they like, and ones they do not. Faster than asking them to describe it.",
                },
                {
                  term: "People & content",
                  detail:
                    "Who can supply source material, and whether staff or customers can appear in content.",
                },
                {
                  term: "Brand voice",
                  detail:
                    "Review existing brand guidance and published content first, then ask only for what is not already clear. No tone questionnaire for a client whose voice is already obvious.",
                },
                {
                  term: "Constraints",
                  detail:
                    "Regulatory or compliance limits, where the client's industry has them.",
                },
              ]}
            />

            <Callout label="Capture what we learn">
              <p>
                Anything established here that the next person would need in
                order to run the account goes into the{" "}
                <strong>Client Social Media Strategy</strong>. Do not leave
                account knowledge only in someone&rsquo;s notes, inbox or
                memory.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="content-model"
            marker="13"
            title="The Content Model"
            intro={
              <p>
                The heart of the Client Social Media Strategy. Without it the
                account launches and then improvises every week.
              </p>
            }
          >
            <RuleBlock
              items={[
                {
                  title: "Audience",
                  body: "Who the content is primarily for. A line or two — not a persona exercise.",
                },
                {
                  title: "Content pillars",
                  body: "Three to five recurring themes the account posts against. They give the calendar a repeatable structure and stop every week starting with “what should we post today?”",
                },
                {
                  title: "Content sources",
                  body: (
                    <>
                      Where the ongoing supply comes from — existing photo and
                      video, client-supplied material, Web Wizards graphics or
                      shoots, staff contributions, product imagery, website and
                      blog content, customer content where appropriate.{" "}
                      <strong>
                        Do not launch an account without this answered.
                      </strong>
                    </>
                  ),
                },
                {
                  title: "Cadence",
                  body: "Publishing frequency per channel, taken from the approved proposal. We do not have standard packages.",
                },
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="horizon"
            marker="14"
            title="Content Planning Horizon"
            intro={
              <p>
                <strong>
                  The further out the plan goes, the higher-level it should be.
                </strong>{" "}
                The calendar exists to help the team plan ahead, not to force
                decisions before they need to be made.
              </p>
            }
          >
            <RuleBlock
              items={[
                {
                  title: "Annual — direction only",
                  body: "Major campaigns, promotions, seasonal moments, events, known product or service priorities, and broad content themes. This is not a commitment to individual posts months out: no copy, no post ideas, no fixed dates, no creative that far ahead.",
                },
                {
                  title: "Quarterly — bring it into focus",
                  body: "Current priorities, campaigns, themes, important dates and a rough topic mix. Sharper than the annual view, but still not every individual post.",
                },
                {
                  title: "Current month — plan the execution",
                  body: "Channel, intended publish timing, the post concept, creative requirements, and approval status where it applies. This is the only horizon where specific content gets planned.",
                },
              ]}
            />

            <Callout label="The roadmap is a planning view, not a document">
              <p>
                <strong>Refresh Annual Content Roadmap</strong> is a recurring
                task on the project, so the annual direction gets revisited
                rather than written once and forgotten. Keep it light — a view
                of campaigns, seasons and themes, not a standalone strategy
                document competing with the Client Social Media Strategy.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="approval"
            marker="15"
            title="Approval & Community"
            intro={
              <p>
                <strong>
                  Approval should match the client, not default to maximum
                  control.
                </strong>{" "}
                Some want to see every post. Others approve a calendar or a
                batch, or only certain categories. A settled account may run with
                very little.
              </p>
            }
          >
            <Checklist
              caption="Confirm for every account"
              items={[
                "Who approves, and who else needs visibility",
                "How approval is given",
                "How far ahead content is submitted",
                "Expected turnaround",
                "Whether anything can publish without explicit approval",
                "What happens when approval is late",
              ]}
            />

            <p className="text-[0.9375rem] leading-relaxed text-slate">
              Today this runs through email and documents. Do not describe a
              formal approval platform we do not have.
            </p>

            <p className="text-[0.9375rem] leading-relaxed text-slate">
              <strong className="font-semibold text-charcoal">
                Community management
              </strong>{" "}
              is not included by default. If it is, agree what we answer
              ourselves, what gets escalated and who receives escalations. If it
              is not, say so plainly — nobody should assume we are watching the
              inbox.
            </p>

            <Callout label="Social workflow tooling is worth reviewing">
              <p>
                Calendars, approvals, scheduling and publishing are all manual
                today. A lightweight social platform could carry all four, and
                the team should evaluate one. No product is recommended here and
                this is not a procurement exercise — any tool has to make the
                workflow simpler, not add process for its own sake.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="rhythm"
            marker="16"
            title="Ongoing Delivery Rhythm"
            intro={
              <p>
                Once onboarding is complete, Productive carries the recurring
                service rhythm. How each of these is actually run is covered in{" "}
                <Link href="/ongoing-delivery/social-media">
                  Ongoing Delivery → Social Media
                </Link>
                .
              </p>
            }
          >
            <Checklist
              items={[
                "Prepare Monthly Content Calendar",
                "Create & Publish Monthly Social Content",
                "Review Performance & Prepare Social Media Report",
                "Prepare & Conduct Quarterly Business Review",
                "Refresh Annual Content Roadmap",
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="done"
            marker="17"
            title="Onboarding Is Complete When"
            intro={
              <p>
                All of these are true. Then the client moves into normal{" "}
                <Link href="/ongoing-delivery/social-media">
                  Ongoing Delivery
                </Link>
                .
              </p>
            }
          >
            <Checklist
              items={[
                "The live Productive project is configured",
                "Project roles are mapped",
                "The recurring Social Media budget is configured",
                "The correct monthly fee from the proposal is entered",
                "Recurring Productive task schedules are set",
                "The Client Intake Questionnaire is complete",
                "The Client Kickoff is complete",
                "Required social access and assets work",
                "Strategy Session(s) are complete",
                "The Client Social Media Strategy is complete",
                "The client has approved the strategy",
                "The first Monthly Content Calendar is ready for approval or production",
                "Major remaining blockers have an owner",
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section id="next" marker="18" title="Then What?">
            <NextModules
              targets={[
                { section: "ongoing-delivery", entry: "social-media" },
                {
                  section: "templates-resources",
                  entry: "social-media-account-guide",
                },
                { section: "service-onboarding", entry: "paid-media" },
                { section: "client-onboarding", entry: "access-assets" },
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
