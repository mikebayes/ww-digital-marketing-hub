import Link from "next/link";
import {
  PageHeader,
  Section,
  RuleBlock,
  Callout,
  Checklist,
  DefinitionTable,
} from "@/components/hub/primitives";
import { OnThisPage, type TocItem } from "@/components/hub/OnThisPage";

const toc: TocItem[] = [
  { id: "roles", marker: "01", title: "Who Owns What" },
  { id: "service", marker: "02", title: "Confirm the Service" },
  { id: "account", marker: "03", title: "Understand the Account" },
  { id: "strategy", marker: "04", title: "The Client Strategy" },
  { id: "content-model", marker: "05", title: "The Content Model" },
  { id: "horizon", marker: "06", title: "Planning Horizon" },
  { id: "approval", marker: "07", title: "Approval & Community" },
  { id: "rhythm", marker: "08", title: "Delivery Rhythm" },
  { id: "onboard", marker: "09", title: "Onboarding a Client" },
];

const SETUP = "/service-onboarding/social-media/setup-launch";

export default function SocialMediaServiceStandards() {
  return (
    <div className="px-6 pt-10 pb-4 md:px-12 lg:px-16 lg:pt-14">
      <PageHeader
        title="Social Media"
        lede="How Web Wizards approaches and runs an organic social account: who owns what, what we need to understand, and the standards the work is held to. Paid social is onboarded under Paid Media, even when it runs on Meta."
        breadcrumb={[
          { label: "Hub", href: "/" },
          { label: "Service Onboarding", href: "/service-onboarding" },
          { label: "Social Media" },
          { label: "Service Standards" },
        ]}
        meta={[
          { label: "Owned by", value: "Account Manager" },
          { label: "Content owner", value: "Social Content Lead" },
          { label: "Scope", value: "Organic social" },
          { label: "Version", value: "0.3 · Sept 2026" },
        ]}
      />

      <div className="doc-layout">
        <article className="@container min-w-0 space-y-12">
          <p className="max-w-2xl text-[1.0625rem] leading-relaxed text-slate">
            This page is the standard. If you are setting up a real client
            right now, the steps are in{" "}
            <Link href={SETUP}>Setup &amp; Launch</Link>.
          </p>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="roles"
            marker="01"
            title="Who Owns What"
            intro={
              <p>
                Each row is one person&rsquo;s job for the whole engagement,
                not just for one step.
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
            id="service"
            marker="02"
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
            marker="03"
            title="Understand the Account"
            intro={
              <p>
                Only what is needed to run the social program. Everything else
                should already be on file.
              </p>
            }
          >
            <Callout label="Do not ask twice">
              <p>
                Read the approved proposal, the Internal Service Brief, the
                returned Client Intake Questionnaire, the client&rsquo;s current
                channels, existing brand guidance and whatever was collected
                during{" "}
                <Link href="/client-onboarding/overview">Client Onboarding</Link>{" "}
                before asking the client anything. Every question we ask twice
                costs us credibility we could have spent elsewhere.
              </p>
            </Callout>

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
                order to run the account goes into the Client Social Media
                Strategy below. Do not leave account knowledge only in
                someone&rsquo;s notes, inbox or memory.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="strategy"
            marker="04"
            title="The Client Social Media Strategy"
            intro={
              <p>
                The core strategic reference for the engagement, and the thing
                every content decision is checked against. It holds the durable
                information someone needs in order to run this account —
                practical and relatively concise, not a strategy deck.
              </p>
            }
          >
            <DefinitionTable
              caption="What belongs in it"
              rows={[
                {
                  term: "Account setup",
                  detail:
                    "Channels, posting cadence, the organic and paid relationship, and community-management scope.",
                },
                {
                  term: "Business direction",
                  detail:
                    "Objectives, priority audiences, priority products and services, and geographic focus where relevant.",
                },
                {
                  term: "Messaging",
                  detail:
                    "Differentiators, core messages, topics or claims to avoid, and any brand, regulatory or compliance constraint the content has to respect.",
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
                    "Approval process, community-management rules, important client contacts, escalation rules, and links to working assets.",
                },
              ]}
            />

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
              = work that needs to happen. Keeping those three apart is what
              stops the strategy turning into a running log.
            </p>

            <p className="text-[0.9375rem] leading-relaxed text-slate">
              A one-page template exists in Templates &amp; Resources. It is
              still published there under its previous name,{" "}
              <Link href="/templates-resources/social-media-account-guide">
                Social Media Account Guide
              </Link>
              , until the rename is made across the Hub. It is the same
              artifact. Writing one is a step in{" "}
              <Link href={SETUP}>Setup &amp; Launch</Link>.
            </p>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="content-model"
            marker="05"
            title="The Content Model"
            intro={
              <p>
                The heart of the strategy. Without it the account launches and
                then improvises every week.
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
            marker="06"
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
                task on every social project, so the annual direction gets
                revisited rather than written once and forgotten. Keep it light
                — a view of campaigns, seasons and themes, not a standalone
                strategy document competing with the Client Social Media
                Strategy.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="approval"
            marker="07"
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
            marker="08"
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
            id="onboard"
            marker="09"
            title="Need to Onboard a Client?"
            intro={
              <p>
                This page is the standard. The process — Productive setup, the
                budget, the meetings and the order they happen in — is a
                separate page you can work through while it is happening.
              </p>
            }
          >
            <ul className="border-t border-rule">
              <li className="border-b border-rule">
                <Link
                  href={SETUP}
                  className="group grid gap-x-8 gap-y-1 py-4 @xl:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]"
                >
                  <span className="text-[0.9375rem] font-semibold text-charcoal transition-colors group-hover:text-teal-ink">
                    Setup &amp; Launch
                  </span>
                  <span className="text-[0.875rem] leading-relaxed text-slate">
                    Eleven steps from an approved engagement to the first
                    monthly content calendar, with the Productive setup.
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
