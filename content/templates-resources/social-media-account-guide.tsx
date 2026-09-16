import Image from "next/image";
import Link from "next/link";
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
  "/templates/social-media-account-guide/web-wizards-social-media-account-guide-example.pdf";
const PREVIEW =
  "/templates/social-media-account-guide/web-wizards-social-media-account-guide-preview.png";

const toc: TocItem[] = [
  { id: "what", marker: "01", title: "What It Is" },
  { id: "how", marker: "02", title: "How It Is Made" },
  { id: "captures", marker: "03", title: "What It Captures" },
  { id: "example", marker: "04", title: "The Example" },
  { id: "next", marker: "05", title: "Then What?" },
];

export default function SocialMediaAccountGuide() {
  return (
    <div className="px-6 pt-10 pb-4 md:px-12 lg:px-16 lg:pt-14">
      <PageHeader
        title="Social Media Account Guide"
        lede="The living internal reference for how a client's social account actually operates. Its job is continuity: if the person running the account leaves, someone else can open this and pick it up."
        breadcrumb={[
          { label: "Hub", href: "/" },
          { label: "Templates & Resources", href: "/templates-resources" },
          { label: "Social Media Account Guide" },
        ]}
        meta={[
          { label: "Owned by", value: "Social Content Lead" },
          { label: "Created", value: "During onboarding" },
          { label: "Lives in", value: "Productive → Docs" },
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
              <p>
                Durable operating information only — the things that stay true
                between campaigns. Four artefacts sit around a social account
                and they are easy to confuse.
              </p>
            }
          >
            <DefinitionTable
              rows={[
                {
                  term: "Internal Service Brief",
                  detail: "What Sales handed to Delivery.",
                },
                {
                  term: "Account Guide",
                  detail:
                    "What Delivery learned and established during onboarding. This document.",
                },
                {
                  term: "Roadmap & calendar",
                  detail: "The changing delivery plan.",
                },
                {
                  term: "Productive tasks",
                  detail: "The work that needs to happen.",
                },
              ]}
            />

            <Callout label="Keep it out of the guide">
              <p>
                No monthly post topics, post copy, upcoming schedule, campaign
                status, reporting history, performance data, meeting notes or
                task status. Those move constantly and live elsewhere. If a line
                would be wrong in three months, it does not belong here.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="how"
            marker="02"
            title="How It Is Made"
            intro={
              <p>
                Written during{" "}
                <Link href="/service-onboarding/social-media">
                  Social Media onboarding
                </Link>
                , once the team has established the account&rsquo;s core
                information.
              </p>
            }
          >
            <RuleBlock
              items={[
                {
                  title: "Gather what already exists",
                  body: (
                    <>
                      The approved proposal, the{" "}
                      <Link href="/templates-resources/internal-service-brief">
                        Internal Service Brief
                      </Link>
                      , onboarding notes, and the client&rsquo;s existing
                      channels and materials.
                    </>
                  ),
                },
                {
                  title: "AI drafts it",
                  body: "Give it the example below as the structure and the material above as the source.",
                },
                {
                  title: "Social Content Lead reviews and corrects",
                  body: "The Social Content Lead owns the final accuracy. The AI draft is only a starting point.",
                },
                {
                  title: "Store it in Productive → Docs",
                  body: "On the client project, named ClientName_Social-Media-Account-Guide_YYYY-MM-DD.",
                },
                {
                  title: "Update when something material changes",
                  body: "A new channel, a new approver, a changed constraint. Not every month, and not as a running log.",
                },
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="captures"
            marker="03"
            title="What It Captures"
            intro={<p>Eight short sections. One page for a normal account.</p>}
          >
            <DefinitionTable
              rows={[
                {
                  term: "01 Platforms & cadence",
                  detail:
                    "Channels managed, how often each one posts, and whether there is a related paid social engagement — not included, a separate Paid Media engagement, or included and coordinated with them.",
                },
                {
                  term: "02 Audience & priorities",
                  detail:
                    "Who the content is for, and what the business is pushing.",
                },
                {
                  term: "03 Content direction",
                  detail:
                    "Pillars, key messages, what to avoid, and brand voice notes.",
                },
                {
                  term: "04 Content sources",
                  detail:
                    "What the client supplies, what we create, who contributes, where assets live.",
                },
                {
                  term: "05 Approval & community",
                  detail:
                    "Approver, method, turnaround, whether community management is included, and the escalation rule.",
                },
                {
                  term: "06 Dates & constraints",
                  detail:
                    "Recurring promotions, seasonal periods, events, and any regulatory limits.",
                },
                {
                  term: "07 Working links",
                  detail: "Calendar, roadmap, reporting and asset library.",
                },
                {
                  term: "08 Material changes",
                  detail:
                    "Durable changes to how the account is run — a new approver, a platform added or dropped, cadence materially changed, community management turned on or off, a new compliance restriction. Two or three lines. Not an activity log, meeting notes or monthly history.",
                },
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="example"
            marker="04"
            title="The Example"
            intro={
              <p>
                A fictional swim school — an ordinary organic social account,
                filled in the way a real one should be. Use it as the structure
                and the level of detail, not as copy to edit.
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
                  alt="Completed Social Media Account Guide for the fictional client Brightwater Swim School, shown as a single page"
                  width={1632}
                  height={2112}
                  className="mx-auto block w-full max-w-lg border border-rule transition-opacity group-hover:opacity-90"
                />
              </a>

              <div className="flex flex-col gap-4 px-6 py-5 @xl:flex-row @xl:items-center @xl:justify-between">
                <div>
                  <SectionLabel>Download</SectionLabel>
                  <p className="mt-2 text-[0.9375rem] leading-snug font-semibold text-charcoal">
                    Social Media Account Guide — worked example
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
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section id="next" marker="05" title="Then What?">
            <NextModules
              targets={[
                { section: "service-onboarding", entry: "social-media" },
                {
                  section: "templates-resources",
                  entry: "internal-service-brief",
                },
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
