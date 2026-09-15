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
  { id: "needed", marker: "02", title: "What We May Need" },
  { id: "process", marker: "03", title: "Request & Track" },
  { id: "done", marker: "04", title: "Complete When" },
  { id: "next", marker: "05", title: "Then What?" },
];

export default function AccessAndAssets() {
  return (
    <div className="px-6 pt-10 pb-4 md:px-12 lg:px-16 lg:pt-14">
      <PageHeader
        title="Access & Assets"
        lede="Getting the accounts, permissions and materials the purchased services need. This page is the common process — what each service actually requires lives in its own service onboarding module."
        breadcrumb={[
          { label: "Hub", href: "/" },
          { label: "Client Onboarding", href: "/client-onboarding" },
          { label: "Access & Assets" },
        ]}
        meta={[
          { label: "Owned by", value: "Account Manager" },
          { label: "Tested by", value: "Service specialist" },
          { label: "Timing", value: "Before kickoff where possible" },
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
                    "Owns the process. Makes sure requests go out, tracks what is outstanding and chases it. Does not decide what each service needs.",
                },
                {
                  term: "Service specialist",
                  detail:
                    "Works out what their service actually requires, and confirms the access works once it has been granted.",
                },
                {
                  term: "Client",
                  detail:
                    "Provides or grants what they control. Our job is to make that easy and to ask once.",
                },
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="needed"
            marker="02"
            title="What We May Need"
            intro={
              <p>
                Categories, not a checklist. The{" "}
                <Link href="/service-onboarding">service onboarding</Link> module
                for what was sold determines the actual list.
              </p>
            }
          >
            <DefinitionTable
              rows={[
                {
                  term: "Platform access",
                  detail:
                    "Analytics, advertising platforms, search platforms, social accounts, website or CMS, tag management, reporting tools.",
                },
                {
                  term: "Brand & creative assets",
                  detail:
                    "Logos, brand guidelines, photography, video, approved creative, and brand fonts or files where relevant.",
                },
                {
                  term: "Business & marketing inputs",
                  detail:
                    "Current offers, priority products or services, target geography, previous campaign information, existing reports or research.",
                },
              ]}
            />

            <Callout label="Ask for what we need, not everything">
              <p>
                Do not send every client the same access list. What we ask for
                should match the services purchased, the platforms the client
                already runs, and the work we are actually responsible for.
                Requesting access to something we have no reason to touch makes
                us look like we are not paying attention.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="process"
            marker="03"
            title="Request & Track"
            intro={
              <p>
                Start early. Requests should be out before the{" "}
                <Link href="/client-onboarding/client-kickoff">kickoff</Link>{" "}
                where possible — the kickoff can clear blockers, but it should
                not be the first time we ask for something obvious.
              </p>
            }
          >
            <RuleBlock
              items={[
                {
                  title: "Ask for the right permission level",
                  body: "Proper account access rather than shared passwords wherever the platform allows it, and use the client's existing account structure rather than setting up a parallel one.",
                },
                {
                  title: "Say what you need and why",
                  body: "A one-line reason gets a faster yes than a bare list of platform names.",
                },
                {
                  title: "Ask once",
                  body: "Check what has already been requested before sending anything. Clients notice when two people ask for the same thing.",
                },
                {
                  title: "Track everything outstanding",
                  body: "As onboarding tasks, each with an owner, a clear request and a follow-up date where it matters.",
                },
                {
                  title: "Confirm it actually works",
                  body: "The specialist logs in and checks. The client saying they sent it is not the same as us having access.",
                },
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section id="done" marker="04" title="Complete When">
            <Checklist
              items={[
                "The access list for the purchased services is known",
                "Requests have been sent",
                "Required access has been tested and works",
                "Required brand and creative assets are received",
                "Anything still outstanding has a named owner and a follow-up date",
              ]}
            />

            <Callout label="Not everything, and not forever" tone="charcoal">
              <p>
                Work can start before every possible asset arrives — just not
                before the ones it actually needs. Missing items are fine while
                they have an owner and a date; what is not fine is an
                outstanding request nobody is chasing.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section id="next" marker="05" title="Then What?">
            <NextModules
              targets={[
                { section: "client-onboarding", entry: "client-kickoff" },
                { section: "client-onboarding", entry: "productive-setup" },
                { section: "service-onboarding" },
                { section: "client-onboarding", entry: "overview" },
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
