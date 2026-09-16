import Link from "next/link";
import {
  PageHeader,
  Section,
  RuleBlock,
  Callout,
  Checklist,
  DefinitionTable,
  NextModules,
} from "@/components/hub/primitives";
import { OnThisPage, type TocItem } from "@/components/hub/OnThisPage";

const toc: TocItem[] = [
  { id: "rhythm", marker: "01", title: "The Operating Rhythm" },
  { id: "monthly-content", marker: "02", title: "Monthly Content Cycle" },
  { id: "monthly-review", marker: "03", title: "Monthly Performance Review" },
  { id: "quarterly", marker: "04", title: "Quarterly Content Planning" },
  { id: "expert", marker: "05", title: "Expert Account Review" },
  { id: "client-review", marker: "06", title: "Client Review" },
  { id: "annual", marker: "07", title: "Annual Roadmap Refresh" },
  { id: "account-guide", marker: "08", title: "Keep the Account Guide Current" },
  { id: "productive", marker: "09", title: "Productive Rhythm" },
  { id: "healthy", marker: "10", title: "A Healthy Account" },
  { id: "next", marker: "11", title: "Then What?" },
];

export default function SocialMediaOngoingDelivery() {
  return (
    <div className="px-6 pt-10 pb-4 md:px-12 lg:px-16 lg:pt-14">
      <PageHeader
        title="Social Media"
        lede="How a live organic social account is run once onboarding is complete. What has to happen every month, every quarter and once a year for the account to keep working."
        breadcrumb={[
          { label: "Hub", href: "/" },
          { label: "Ongoing Delivery", href: "/ongoing-delivery" },
          { label: "Social Media" },
        ]}
        meta={[
          { label: "Owned by", value: "Account Manager" },
          { label: "Delivery owner", value: "Social Content Lead" },
          {
            label: "Expert oversight",
            value: "Digital Marketing Manager / Service Lead",
          },
          { label: "Timing", value: "After onboarding" },
          { label: "Version", value: "0.1 · Sept 2026" },
        ]}
      />

      <div className="mt-12 grid gap-12 min-[1400px]:grid-cols-[minmax(0,1fr)_var(--spacing-toc)] min-[1400px]:gap-14">
        <article className="@container min-w-0 space-y-12">
          {/* ---------------------------------------------------------------- */}
          <Section
            id="rhythm"
            marker="01"
            title="The Operating Rhythm"
            intro={
              <p>
                Once onboarding is complete, Social Media settles into a
                repeating monthly, quarterly and annual rhythm. The aim is
                consistency without adding process for its own sake.
              </p>
            }
          >
            <DefinitionTable
              rows={[
                {
                  term: "Every month",
                  detail: "The content cycle, and a short performance review.",
                },
                {
                  term: "Every quarter",
                  detail:
                    "Content planning, expert account review, and a client review where the account warrants one.",
                },
                {
                  term: "Every year",
                  detail: "A refresh of the high-level roadmap.",
                },
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="monthly-content"
            marker="02"
            title="Monthly Content Cycle"
            intro={
              <p>
                The core recurring workflow. Six steps, not six task lists.
              </p>
            }
          >
            <RuleBlock
              items={[
                {
                  title: "Review current priorities",
                  body: "The current quarterly direction, upcoming promotions, events, seasonal dates and anything new from the client.",
                },
                {
                  title: "Prepare the content calendar",
                  body: "Plan the upcoming cycle against the approved cadence and content pillars.",
                },
                {
                  title: "Produce the content",
                  body: "Write the copy and prepare graphics, photography or video as the scope requires.",
                },
                {
                  title: "Get approval where required",
                  body: "Use the approval process agreed for the account. Not every account needs every post approved individually.",
                },
                {
                  title: "Publish",
                  body: "Publish or schedule the approved content using the account's current workflow.",
                },
                {
                  title: "Close the cycle",
                  body: "Confirm what was planned actually went out, and carry any issue or change into the next cycle.",
                },
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="monthly-review"
            marker="03"
            title="Monthly Performance Review"
            intro={
              <p>
                Short. The point is to find something worth changing, not to
                look at metrics every month out of habit.
              </p>
            }
          >
            <Checklist
              items={[
                "Performance since the last review has been looked at",
                "Material wins, issues or changes are identified",
                "Anything worth adjusting is carried into the next cycle",
                "Reporting is prepared and delivered on the agreed client cadence",
              ]}
            />

            <p className="text-[0.9375rem] leading-relaxed text-slate">
              Report format and ownership are a shared standard rather than a
              social-specific one, and will live in Reporting.
            </p>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="quarterly"
            marker="04"
            title="Quarterly Content Planning"
            intro={
              <p>
                Once a quarter, bring the longer-term plan back into focus.
              </p>
            }
          >
            <Checklist
              items={[
                "Business priorities",
                "Campaigns and promotions",
                "Seasonal dates and major events",
                "Content themes and the rough topic mix",
                "Any change in channel emphasis",
              ]}
            />

            <Callout label="Not three months of posts">
              <p>
                This is direction, not detailed post planning. Specific post
                concepts belong in the monthly content calendar. Update the
                near-term roadmap or calendar with whatever the quarter changed.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="expert"
            marker="05"
            title="Expert Account Review"
            intro={
              <p>
                The Digital Marketing Manager or service lead is not expected to
                take part in every recurring task. They review at the points
                where their perspective can materially improve the account.
              </p>
            }
          >
            <Checklist
              items={[
                "Launch readiness at the end of onboarding, where it is useful",
                "The quarterly account review",
                "Material performance issues",
                "Tracking or platform concerns",
                "Major changes in strategy, channels, or paid and organic coordination",
                "A client concern or escalation",
              ]}
            />

            <Callout label="Oversight, not a bottleneck">
              <p>
                For a normal healthy account, quarterly visibility may be all
                that is needed. Expert approval is{" "}
                <strong>not</strong> required for every content calendar, report
                or client email.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="client-review"
            marker="06"
            title="Client Review"
            intro={
              <p>
                Where the size and nature of the account warrant it, run a
                periodic review with the client. Not every small client needs a
                formal QBR.
              </p>
            }
          >
            <Checklist
              items={[
                "Results since the last review",
                "What has changed on their side",
                "Upcoming priorities",
                "What is working and what is not",
                "Opportunities or concerns",
                "Direction for the next quarter",
              ]}
            />

            <p className="text-[0.9375rem] leading-relaxed text-slate">
              Format and cadence will be set by the shared Client Reviews
              standard.
            </p>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="annual"
            marker="07"
            title="Annual Roadmap Refresh"
            intro={
              <p>
                Once a year, refresh the high-level direction set during
                onboarding. Keep it high level — no individual posts months in
                advance.
              </p>
            }
          >
            <Checklist
              items={[
                "Major campaigns and promotions",
                "Seasonal periods and important events",
                "Changing business priorities",
                "Broad content themes",
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="account-guide"
            marker="08"
            title="Keep the Account Guide Current"
            intro={
              <p>
                The{" "}
                <Link href="/templates-resources/social-media-account-guide">
                  Social Media Account Guide
                </Link>{" "}
                is only useful if it is still true. Update it when durable
                account information changes, not for ordinary monthly activity.
              </p>
            }
          >
            <Checklist
              items={[
                "The approver changes",
                "A platform is added or dropped",
                "Posting cadence changes materially",
                "Content sources change",
                "Community management is turned on or off",
                "A new brand or compliance restriction applies",
                "The way the account is run changes significantly",
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="productive"
            marker="09"
            title="Productive Rhythm"
            intro={
              <p>
                The recurring work above should exist as recurring tasks rather
                than as someone&rsquo;s memory.
              </p>
            }
          >
            <Checklist
              items={[
                "Prepare Monthly Content Calendar",
                "Prepare Social Media Report, on the cadence the engagement sets",
                "Quarterly Content & Account Review, covering next-quarter priorities, account performance, expert review and any material adjustments",
                "Annual Content Roadmap Refresh",
                "Client Review where applicable",
              ]}
            />

            <Callout label="To be finalized with the Social Media team">
              <p>
                The final Social Media Productive template and task
                configuration will be documented here after the team confirms
                the operating cadence. The template currently being tested is
                not the agreed version.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="healthy"
            marker="10"
            title="A Healthy Account"
            intro={
              <p>
                Ongoing delivery never completes, so there is no done. This is
                what good looks like at any point in time.
              </p>
            }
          >
            <Checklist
              items={[
                "A current content calendar exists",
                "Upcoming priorities are understood",
                "Approvals are under control",
                "Reporting is current",
                "Client blockers have owners",
                "The Account Guide is still accurate",
                "Recurring Productive tasks are current",
                "Material performance or account issues are being addressed",
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section id="next" marker="11" title="Then What?">
            <NextModules
              targets={[
                { section: "service-onboarding", entry: "social-media" },
                {
                  section: "templates-resources",
                  entry: "social-media-account-guide",
                },
                { section: "ongoing-delivery", entry: "reporting" },
                { section: "ongoing-delivery", entry: "client-reviews" },
                { section: "ongoing-delivery", entry: "scope-changes" },
                { section: "ongoing-delivery", entry: "qa-escalation" },
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
