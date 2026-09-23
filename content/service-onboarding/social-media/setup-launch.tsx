import Link from "next/link";
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
import { Screenshot } from "@/components/hub/Screenshot";
import { OnThisPage, type TocItem } from "@/components/hub/OnThisPage";

const toc: TocItem[] = [
  { id: "glance", marker: "01", title: "At a Glance" },
  { id: "handoff", marker: "02", title: "Internal Handoff" },
  { id: "productive", marker: "03", title: "Set Up the Project" },
  { id: "budget", marker: "04", title: "Add the Budget" },
  { id: "tasks", marker: "05", title: "Task Dates & Recurrence" },
  { id: "intake", marker: "06", title: "Onboarding Email & Intake" },
  { id: "kickoff", marker: "07", title: "Client Kickoff" },
  { id: "access", marker: "08", title: "Access & Assets" },
  { id: "sessions", marker: "09", title: "Strategy Session(s)" },
  { id: "strategy", marker: "10", title: "Create the Strategy" },
  { id: "approval", marker: "11", title: "Present & Approve" },
  { id: "calendar", marker: "12", title: "First Content Calendar" },
  { id: "done", marker: "13", title: "Complete When" },
  { id: "next", marker: "14", title: "Then What?" },
];

const IMG = "/productive/social-media";
const STANDARDS = "/service-onboarding/social-media/service-standards";

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
  { title: "Create Client Social Media Strategy", owner: "Social Content Lead" },
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

export default function SocialMediaSetupLaunch() {
  return (
    <div className="px-6 pt-10 pb-4 md:px-12 lg:px-16 lg:pt-14">
      <PageHeader
        title="Setup & Launch"
        lede="Onboarding an organic social client, from an approved engagement through to the first monthly content calendar. Roughly three to four weeks, depending on account complexity, access and client availability."
        breadcrumb={[
          { label: "Hub", href: "/" },
          { label: "Service Onboarding", href: "/service-onboarding" },
          { label: "Social Media" },
          { label: "Setup & Launch" },
        ]}
        meta={[
          { label: "Owned by", value: "Account Manager" },
          { label: "Content owner", value: "Social Content Lead" },
          { label: "Typical length", value: "3–4 weeks" },
          { label: "Version", value: "0.3 · Sept 2026" },
        ]}
      />

      <div className="doc-layout">
        <article className="@container min-w-0 space-y-12">
          <p className="max-w-2xl text-[1.0625rem] leading-relaxed text-slate">
            This page is the process. How we think about running a social
            account — roles, content model, planning horizon, approval
            standards — is in{" "}
            <Link href={STANDARDS}>Service Standards</Link>.
          </p>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="glance"
            marker="01"
            title="Onboarding at a Glance"
            intro={
              <p>
                Eleven steps from a signed proposal to a first content calendar.
                Each one is written out below.
              </p>
            }
          >
            <AtAGlance />

            <Callout label="Productive setup happens after the internal handoff">
              <p>
                Once the internal handoff is complete, create the live
                Productive project, configure the budget, and set the task dates
                and recurrence — sections <strong>03</strong> to{" "}
                <strong>05</strong>. That is internal setup rather than one of
                the eleven steps above, and it should be done before client
                onboarding gets underway.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="handoff"
            marker="02"
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
            id="productive"
            marker="03"
            title="Set Up the Project in Productive"
            intro={
              <p>
                With the handoff done, set the live project up before client
                onboarding gets underway. The template carries the standard task
                structure, so almost nothing has to be built by hand.
              </p>
            }
          >
            <Subsection title="Create the project" eyebrow="02.1">
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

            <Subsection title="Name and configure it" eyebrow="02.2">
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

            <Subsection title="Map the project roles" eyebrow="02.3">
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
                  { term: "Salesperson", detail: "Whoever sold the engagement." },
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

            <Subsection title="Confirm who is on the project" eyebrow="02.4">
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
            <Subsection title="Create it from the template" eyebrow="03.1">
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

            <Subsection title="Replace the template amount" eyebrow="03.2">
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
                  <strong>Do not leave the template amount in place.</strong> It
                  will invoice the client the wrong figure every month until
                  somebody notices.
                </p>
              </Callout>
            </Subsection>

            <Subsection title="Make the budget recurring" eyebrow="03.3">
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
                  { term: "Create invoices automatically", detail: "On." },
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
                { term: "Prepare Monthly Content Calendar", detail: "Monthly." },
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
                { term: "Refresh Annual Content Roadmap", detail: "Annually." },
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
            id="intake"
            marker="06"
            title="Send the Onboarding Email & Intake Questionnaire"
            intro={
              <p>
                Once the handoff is done, the Account Manager sends the
                onboarding email with the Client Intake Questionnaire, using the{" "}
                <Link href="/templates-resources/client-onboarding-email">
                  Client Onboarding Email
                </Link>{" "}
                template. It should introduce the Account Manager and the
                delivery process, say what happens next, provide the
                questionnaire and set out the timeline below.
              </p>
            }
          >
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
              It is a shape, not a service level agreement. Complexity, access
              and client availability all move it.
            </p>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="kickoff"
            marker="07"
            title="Review the Intake & Run the Kickoff"
            intro={
              <p>
                The kickoff is deliberately lightweight, and is often the first
                time the client meets the delivery team. The{" "}
                <Link href="/client-onboarding/client-kickoff">
                  Client Kickoff
                </Link>{" "}
                standard covers how to run it.
              </p>
            }
          >
            <Callout label="Do not ask twice">
              <p>
                Before the meeting, read the approved proposal, the Internal
                Service Brief, the returned intake questionnaire, the
                client&rsquo;s current channels and their existing brand
                material. The kickoff fills gaps; it does not start from
                nothing.
              </p>
            </Callout>

            <Checklist
              items={[
                "Introductions",
                "Review the questionnaire together",
                "Fill the gaps it left",
                "Confirm or clarify the important answers",
                "Identify the access and assets we will need",
                "Confirm client contacts and the approval structure",
                "Explain what happens next",
              ]}
            />

            <Callout label="Not the strategy workshop">
              <p>
                The kickoff confirms the relationship and the information. The
                thinking happens in the Strategy Session, which is a separate
                meeting — section <strong>09</strong>.
              </p>
            </Callout>
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
              The{" "}
              <strong className="font-semibold text-charcoal">
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
              </p>
            </Subsection>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="sessions"
            marker="09"
            title="Conduct the Strategy Session(s)"
            intro={
              <p>
                A separate, deeper working conversation, led by the Social
                Content Lead. One session is enough for a straightforward
                account; a larger or more complex engagement may need more than
                one.
              </p>
            }
          >
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
              The standards behind each of these — how we think about audiences,
              pillars, cadence and approval — are in{" "}
              <Link href={STANDARDS}>Service Standards</Link>.
            </p>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="strategy"
            marker="10"
            title="Create the Client Social Media Strategy"
            intro={
              <p>
                The Social Content Lead writes it from everything gathered so
                far: the approved proposal, the Internal Service Brief, the
                intake questionnaire, the kickoff and the strategy session(s).
              </p>
            }
          >
            <p className="text-[0.9375rem] leading-relaxed text-slate">
              What belongs in it, and why it is kept separate from the calendar
              and the task list, is set out in{" "}
              <Link href={`${STANDARDS}#strategy`}>
                Service Standards → The Client Social Media Strategy
              </Link>
              . A one-page template is in Templates &amp; Resources.
            </p>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="approval"
            marker="11"
            title="Present the Strategy & Obtain Approval"
            intro={
              <p>
                This is the point at which we find out whether we understood the
                client, and it is cheaper to find out now than in the third
                month of content.
              </p>
            }
          >
            <Checklist
              items={[
                "Present the strategy to the client",
                "Confirm we understood them correctly",
                "Review audiences, messages and content pillars",
                "Gather feedback and identify what needs to change",
                "Revise where required",
                "Obtain approval before detailed content production begins",
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="calendar"
            marker="12"
            title="Prepare the First Monthly Content Calendar"
            intro={
              <p>
                Once the strategy is approved, the Social Content Lead builds
                the first calendar and prepares it for approval and production.
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

          {/* ---------------------------------------------------------------- */}
          <Section
            id="done"
            marker="13"
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
                "The correct monthly fee from the proposal is entered",
                "The recurring Social Media budget is configured",
                "Task dates and recurrence are set",
                "The Client Intake Questionnaire is complete",
                "The Client Kickoff is complete",
                "Required social access and assets are verified as working",
                "Strategy Session(s) are complete",
                "The Client Social Media Strategy is complete",
                "The client has approved the strategy",
                "The first Monthly Content Calendar is ready for approval or production",
                "Remaining blockers have an owner",
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section id="next" marker="14" title="Then What?">
            <NextModules
              targets={[
                { section: "ongoing-delivery", entry: "social-media" },
                {
                  section: "templates-resources",
                  entry: "social-media-account-guide",
                },
                { section: "client-onboarding", entry: "access-assets" },
              ]}
            />

            <ul className="border-t border-rule">
              <li className="border-b border-rule">
                <Link
                  href={STANDARDS}
                  className="group grid gap-x-8 gap-y-1 py-4 @xl:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]"
                >
                  <span className="text-[0.9375rem] font-semibold text-charcoal transition-colors group-hover:text-teal-ink">
                    Social Media → Service Standards
                  </span>
                  <span className="text-[0.875rem] leading-relaxed text-slate">
                    How Web Wizards approaches and runs an organic social
                    account.
                  </span>
                </Link>
              </li>
            </ul>
          </Section>
        </article>

        <aside className="hidden min-[1400px]:block">
          <OnThisPage items={toc} />
        </aside>
      </div>
    </div>
  );
}
