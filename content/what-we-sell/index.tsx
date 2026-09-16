import Link from "next/link";
import {
  PageHeader,
  Section,
  Subsection,
  RuleBlock,
  Callout,
  DefinitionTable,
  NextModules,
} from "@/components/hub/primitives";
import { PackageTable } from "@/components/hub/brand";
import { OnThisPage, type TocItem } from "@/components/hub/OnThisPage";

const toc: TocItem[] = [
  { id: "how-we-sell", marker: "01", title: "How We Sell" },
  { id: "seo", marker: "02", title: "SEO" },
  { id: "paid-media", marker: "03", title: "Paid Media" },
  { id: "social-media", marker: "04", title: "Social Media Management" },
  { id: "email", marker: "05", title: "Email Marketing" },
  { id: "one-time", marker: "06", title: "One-Time Projects" },
  { id: "next", marker: "07", title: "Then What?" },
];

const SEO_PACKAGES = [
  { name: "Essential (Bespoke)", price: "$1,250/mo" },
  { name: "Starter", price: "$1,500/mo" },
  { name: "Starter+", price: "$2,000/mo" },
  { name: "Grow", price: "$2,500/mo" },
  { name: "Dominance", price: "$3,000/mo" },
  { name: "Take Over", price: "$3,500/mo" },
];

const SEO_ROWS = [
  { label: "Keywords", values: ["5", "5", "5", "10", "25", "35"] },
  { label: "Backlinks", values: ["0", "11", "11", "21", "33", "47"] },
  {
    label: "Technical on-site SEO fixes",
    values: ["Yes", "Yes", "Yes", "Yes", "Yes", "Yes"],
  },
  {
    label: "AEO / GEO optimization",
    values: ["Yes", "Yes", "Yes", "Yes", "Yes", "Yes"],
  },
  {
    label: "Toxic link monitoring",
    values: ["Yes", "Yes", "Yes", "Yes", "Yes", "Yes"],
  },
  {
    label: "High domain authority articles",
    values: ["0", "3", "3", "3", "4", "6"],
  },
  {
    label: "Authority editorial placements",
    values: ["0", "3", "3", "3", "4", "6"],
  },
  {
    label: "On-site content creation",
    values: ["No", "0 words", "2,000 words", "2,000 words", "2,000 words", "4,000 words"],
  },
  { label: "Business listings", values: ["No", "5", "5", "15", "25", "35"] },
  {
    label: "Performance & growth reporting",
    values: ["Yes, limited", "Yes", "Yes", "Yes", "Yes", "Yes"],
  },
  {
    label: "Analytics / GSC setup",
    values: ["No", "No", "No", "No", "No", "No"],
  },
];

export default function WhatWeSell() {
  return (
    <div className="px-6 pt-10 pb-4 md:px-12 lg:px-16 lg:pt-14">
      <PageHeader
        marker="01"
        title="What We Sell"
        lede="An internal reference for what Web Wizards offers, the usual shape of each service, and what is not settled yet. Written for Delivery, not for clients."
        breadcrumb={[{ label: "Hub", href: "/" }, { label: "What We Sell" }]}
        meta={[
          { label: "Audience", value: "Internal — Digital Marketing" },
          { label: "Governs", value: "Nothing — the proposal does" },
          { label: "Status", value: "SEO defined, others open" },
          { label: "Version", value: "0.1 · Sept 2026" },
        ]}
      />

      <div className="mt-12 grid gap-12 min-[1400px]:grid-cols-[minmax(0,1fr)_var(--spacing-toc)] min-[1400px]:gap-14">
        <article className="@container min-w-0 space-y-12">
          {/* ---------------------------------------------------------------- */}
          <Section id="how-we-sell" marker="01" title="How We Sell">
            <Callout label="Proposal Is the Source of Truth">
              <p>
                <strong>
                  The approved proposal is always the source of truth for a
                  specific client.
                </strong>{" "}
                Nothing on this page overrides it. If a proposal and this page
                disagree, the proposal is right and this page needs updating.
              </p>
            </Callout>

            <RuleBlock
              items={[
                {
                  title: "Standard offerings where they fit",
                  body: "We have defined packages for SEO. They are a starting point for a conversation, not a menu the client has to choose from.",
                },
                {
                  title: "Custom scopes are normal",
                  body: "Plenty of good engagements do not match a package. That is expected, not an exception to apologise for.",
                },
                {
                  title: "Recurring and fixed-term both exist",
                  body: "Retained monthly work, fixed-term engagements and one-time projects are all valid shapes.",
                },
                {
                  title: "One-time work is scoped around an outcome",
                  body: "A defined deliverable with an end, not an open-ended arrangement that quietly renews.",
                },
                {
                  title: "Media spend is separate from our fee",
                  body: "Advertising budget is the client's spend and sits outside the management fee unless a proposal says otherwise.",
                },
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="seo"
            marker="02"
            title="SEO"
            intro={
              <p>
                Recurring SEO management. Terms vary widely in practice —
                roughly three months to three years. Standard packages exist and
                custom packages are equally available.
              </p>
            }
          >
            <Subsection title="What the work covers" eyebrow="02.1">
              <p>
                Keyword targeting, backlink and authority building, technical
                on-site fixes, AEO and GEO optimization, toxic-link monitoring,
                authority articles and editorial placements, on-site content,
                business listings, and performance reporting. What a given
                client actually gets depends on the tier or the custom scope.
              </p>
            </Subsection>

            <PackageTable columns={SEO_PACKAGES} rows={SEO_ROWS} />

            <Callout label="Notes on these packages">
              <p>
                <strong>Analytics and GSC setup is a &ldquo;No&rdquo; on every
                tier</strong> in the current package definition. Where a client
                needs it, scope and price it separately rather than assuming it
                is covered.
              </p>
              <p>
                The tiers are a starting point. A client with unusual
                requirements gets a custom scope, and Essential is already
                labelled bespoke.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="paid-media"
            marker="03"
            title="Paid Media"
            intro={
              <p>
                Google Ads and paid social, including anything running on Meta.
                The service is real and sold today; the commercial model is not
                settled.
              </p>
            }
          >
            <Callout label="Commercial model to be finalized">
              <p>
                <strong>Typical pricing: TBD. Typical term: TBD.</strong> No
                ranges are published here because none have been agreed. Price
                from the specific engagement and record it in the proposal.
              </p>
            </Callout>

            <DefinitionTable
              caption="Typical scope"
              rows={[
                {
                  term: "Channels",
                  detail: "Google Ads, Meta Ads and other paid social.",
                },
                {
                  term: "Setup",
                  detail:
                    "Campaign build and deployment, audience or keyword targeting, conversion tracking.",
                },
                {
                  term: "Ongoing",
                  detail:
                    "Campaign management, optimization and recommendations.",
                },
                {
                  term: "Measurement",
                  detail:
                    "Reporting may cover conversion rate, click-through rate, cost per click, cost per conversion, spend, reach and impressions, conversion volume, and campaign insights. What a client actually receives is set by their proposal, not by this list.",
                },
              ]}
            />

            <DefinitionTable
              caption="Engagement types"
              rows={[
                {
                  term: "Ongoing monthly management",
                  detail: "Retained, continuing until either side ends it.",
                },
                {
                  term: "Fixed-term campaign management",
                  detail:
                    "For example: the client supplies the campaign concept or copy, and Web Wizards deploys and executes the campaign, monitors performance, manages analytics and provides insights across the campaign period.",
                },
                {
                  term: "One-time setup, audit or remediation",
                  detail: "Scoped work with an end date. See below.",
                },
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="social-media"
            marker="04"
            title="Social Media Management"
            intro={
              <p>
                Organic social. Facebook and Instagram are the usual pair,
                LinkedIn is common, TikTok and YouTube only where specifically
                scoped.
              </p>
            }
          >
            <Callout label="Commercial model to be finalized">
              <p>
                <strong>Typical pricing: TBD. Typical term: TBD.</strong> There
                is no package structure yet. Scope and price each engagement
                individually until one is agreed.
              </p>
            </Callout>

            <DefinitionTable
              caption="Typical scope"
              rows={[
                {
                  term: "Planning",
                  detail: "Content planning, content calendars, strategy.",
                },
                {
                  term: "Production",
                  detail:
                    "Copywriting, graphic design, and photography or video where included.",
                },
                {
                  term: "Running it",
                  detail: "Publishing and reporting.",
                },
                {
                  term: "Not included by default",
                  detail:
                    "Community management. Some accounts have it; do not assume it.",
                },
              ]}
            />

            <Callout label="Paid social sits under Paid Media">
              <p>
                Paid social advertising belongs under{" "}
                <a href="#paid-media">Paid Media</a>, even when it runs on the
                same platforms. Where a client buys both, the two services
                coordinate on creative, offers, audiences and timing.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="email"
            marker="05"
            title="Email Marketing"
            intro={
              <p>
                Listed so the gap is visible rather than assumed. This is the
                least defined thing we sell.
              </p>
            }
          >
            <Callout label="Service definition to be developed">
              <p>
                No pricing, term, platforms or package structure have been
                agreed. Potential scope includes campaign creation, copy and
                design, newsletters, list segmentation, automation sequences,
                and measurement. Treat any email engagement as fully custom and
                raise it before quoting.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="one-time"
            marker="06"
            title="One-Time Projects"
            intro={
              <p>
                Scoped around a defined outcome. A project can run several weeks
                or months without becoming a retainer — the difference is that
                it ends.
              </p>
            }
          >
            <Callout label="Keeping the scope defined">
              <p>
                <strong>
                  One-time work should have a defined outcome. It should not
                  quietly become an undefined mini-retainer.
                </strong>{" "}
                If a project keeps extending, stop and re-contract it properly.
              </p>
            </Callout>

            <DefinitionTable
              caption="Examples, not a menu"
              rows={[
                {
                  term: "SEO",
                  detail:
                    "Technical remediation, content production, audit or cleanup, keyword research, site-migration SEO, and website changes needed for SEO.",
                },
                {
                  term: "Paid Media",
                  detail:
                    "Account audit or restructure, conversion tracking setup or cleanup, campaign and account setup, fixed-term campaign deployment, analytics and measurement setup, campaign-readiness review.",
                },
                {
                  term: "Social Media",
                  detail:
                    "Account or platform setup, profile cleanup, access and infrastructure cleanup, initial content strategy or roadmap, social audit, initial content and creative launch work.",
                },
                {
                  term: "Cross-service",
                  detail:
                    "Analytics, GA4 and GTM work, marketing audits, research, reporting setup, and other clearly scoped implementation work.",
                },
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="next"
            marker="07"
            title="Then What?"
            intro={
              <p>
                Once something is sold, it moves into{" "}
                <Link href="/client-onboarding/overview">Client Onboarding</Link>
                .
              </p>
            }
          >
            <NextModules
              targets={[
                { section: "client-onboarding", entry: "overview" },
                { section: "client-onboarding", entry: "internal-handoff" },
                { section: "service-onboarding" },
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
