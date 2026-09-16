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
  { id: "roles", marker: "01", title: "Who Owns What" },
  { id: "service", marker: "02", title: "Confirm the Service" },
  { id: "account", marker: "03", title: "Understand the Account" },
  { id: "access", marker: "04", title: "Access & Assets" },
  { id: "content-model", marker: "05", title: "The Content Model" },
  { id: "approval", marker: "06", title: "Approval & Community" },
  { id: "launch", marker: "07", title: "Prepare to Launch" },
  { id: "done", marker: "08", title: "Complete When" },
  { id: "next", marker: "09", title: "Then What?" },
];

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
          { label: "Version", value: "0.1 · Sept 2026" },
        ]}
      />

      <div className="mt-12 grid gap-12 min-[1400px]:grid-cols-[minmax(0,1fr)_var(--spacing-toc)] min-[1400px]:gap-14">
        <article className="@container min-w-0 space-y-12">
          {/* ---------------------------------------------------------------- */}
          <Section id="roles" marker="01" title="Who Owns What">
            <DefinitionTable
              rows={[
                {
                  term: "Account Manager",
                  detail:
                    "Owns onboarding and client coordination — chasing outstanding client input and approvals, and keeping responsibilities between specialists clear.",
                },
                {
                  term: "Social Content Lead",
                  detail:
                    "Owns the content approach: planning, pillars, copy, creative, photo and video, the calendar and the first content cycle.",
                },
                {
                  term: "Digital / Platform Lead",
                  detail:
                    "Supports where applicable — Meta business and account infrastructure, platform access, tracking, and the handoff into Paid Media where paid social is included.",
                },
                {
                  term: "Client",
                  detail:
                    "Access they control, business priorities, brand guidance and assets we do not already hold, approvals, and an escalation contact.",
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
                  detail:
                    "Included or not. Do not assume it is.",
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
                Read the Internal Service Brief, the proposal, existing brand
                guidance, their current channels and whatever was collected
                during{" "}
                <Link href="/client-onboarding/overview">Client Onboarding</Link>{" "}
                before asking the client anything. This step fills gaps.
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
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="access"
            marker="04"
            title="Access & Assets"
            intro={
              <p>
                The general process is in{" "}
                <Link href="/client-onboarding/access-assets">
                  Access &amp; Assets
                </Link>
                . Only the social-specific list belongs here, and only for the
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
                    "The brand and creative asset library. Website or CMS access is not needed by default — ask only if the scope requires it.",
                },
              ]}
            />

            <p className="text-[0.9375rem] leading-relaxed text-slate">
              The specialist confirms each one actually works.
            </p>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="content-model"
            marker="05"
            title="The Content Model"
            intro={
              <p>
                The main internal output of onboarding. Without it the account
                launches and then improvises every week.
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
            id="approval"
            marker="06"
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
              ourselves, what gets escalated and who the escalation contact is.
              If it is not, say so plainly — nobody should assume we are watching
              the inbox.
            </p>

            <Callout
              label="Social workflow tooling is worth reviewing"
              tone="charcoal"
            >
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
            id="launch"
            marker="07"
            title="Prepare to Launch"
            intro={
              <p>
                Record where the account started: followers, recent reach or
                impressions, engagement, recent posting frequency, and social
                traffic where useful. Captured once. Reporting standards are set
                separately.
              </p>
            }
          >
            <Callout label="Not a strategy document">
              <p>
                There is no mandatory Social Media Launch Strategy PDF. What
                onboarding produces is the operating setup itself — channels,
                cadence, pillars, sources, responsibilities, approval workflow,
                community rules — plus the first content calendar or batch for
                the client. If a larger client needs a formal strategy document
                later, write one then.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section id="done" marker="08" title="Complete When">
            <Checklist
              items={[
                "Service scope and channels are confirmed",
                "Required platform access works",
                "Brand guidance and assets are available",
                "Audiences and business priorities are understood",
                "Content pillars are defined",
                "Content sources are identified",
                "Posting cadence is confirmed",
                "Approval process is confirmed",
                "Community-management responsibility is clear",
                "Baseline metrics are captured",
                "The first content cycle is planned or in production",
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section id="next" marker="09" title="Then What?">
            <NextModules
              targets={[
                { section: "service-onboarding", entry: "paid-media" },
                { section: "client-onboarding", entry: "access-assets" },
                { section: "ongoing-delivery", entry: "reporting" },
                { section: "ongoing-delivery" },
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
