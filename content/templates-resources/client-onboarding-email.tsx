import {
  PageHeader,
  Section,
  Callout,
  Checklist,
  DefinitionTable,
  NextModules,
} from "@/components/hub/primitives";
import { OnThisPage, type TocItem } from "@/components/hub/OnThisPage";

const toc: TocItem[] = [
  { id: "purpose", marker: "01", title: "What It Has to Do" },
  { id: "include", marker: "02", title: "What to Include" },
  { id: "examples", marker: "03", title: "Examples" },
  { id: "next", marker: "04", title: "Then What?" },
];

export default function ClientOnboardingEmail() {
  return (
    <div className="px-6 pt-10 pb-4 md:px-12 lg:px-16 lg:pt-14">
      <PageHeader
        title="Client Onboarding Email"
        lede="The first client-facing email after an engagement is approved. The Account Manager sends it once they are assigned and the internal handoff is done."
        breadcrumb={[
          { label: "Hub", href: "/" },
          { label: "Templates & Resources", href: "/templates-resources" },
          { label: "Client Onboarding Email" },
        ]}
        meta={[
          { label: "Sent by", value: "Account Manager" },
          { label: "When", value: "After internal handoff" },
          { label: "Length", value: "Short" },
          { label: "Version", value: "0.1 · Sept 2026" },
        ]}
      />

      <div className="doc-layout">
        <article className="@container min-w-0 space-y-12">
          {/* ---------------------------------------------------------------- */}
          <Section
            id="purpose"
            marker="01"
            title="What It Has to Do"
            intro={<p>Four things. If the email does those, it has worked.</p>}
          >
            <Checklist
              items={[
                "Who their main point of contact is",
                "What happens next",
                "What we need from them right now",
                "What to expect in the first stage of onboarding",
              ]}
            />

            <Callout label="Use your own voice">
              <p>
                These examples are starting points, not scripts. Many Web
                Wizards clients are long-standing relationships, so the email
                should sound natural for that relationship. Clarity is the goal,
                not identical wording — do not force formal language where it
                does not fit.
              </p>
              <p>
                How much context to give depends on the relationship. A
                long-standing client may need very little. A new client needs to
                know straight away who you are and which engagement you are
                writing about, because this may be the first thing they have had
                from us since the proposal.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="include"
            marker="02"
            title="What to Include"
            intro={
              <p>
                Typical ingredients, not a required order. Use the ones that
                apply.
              </p>
            }
          >
            <DefinitionTable
              rows={[
                {
                  term: "Opening context",
                  detail:
                    "What the engagement is, that it is with Web Wizards, and why you are writing. Never assume the client already knows what the email refers to.",
                },
                {
                  term: "Main contact",
                  detail:
                    "Who they deal with day to day, and anyone else they will hear from.",
                },
                {
                  term: "Immediate next step",
                  detail: "The one thing happening next, not the whole plan.",
                },
                {
                  term: "What we need",
                  detail:
                    "The access, assets or answers that are actually blocking work — not a full wish list.",
                },
                {
                  term: "First focus",
                  detail: "What the team is working on while they get that to us.",
                },
                {
                  term: "What follows",
                  detail:
                    "A kickoff call or the next update, where either is relevant.",
                },
              ]}
            />

            <p className="text-[0.9375rem] leading-relaxed text-slate">
              Add two to four next steps specific to what was sold, where they
              help. For a social engagement that might be confirming channels
              and posting cadence, confirming access and approvals, agreeing
              content priorities, and preparing the first content calendar.
              There are no per-service email templates — take the steps from the
              relevant service onboarding module.
            </p>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="examples"
            marker="03"
            title="Examples"
            intro={
              <p>
                Three shapes, depending on the relationship and the size of the
                work. Adapt one; do not copy it.
              </p>
            }
          >
            <Callout label="Existing client, familiar relationship">
              <p>Hi Priya,</p>
              <p>
                I&rsquo;m following up on the social media work we talked about
                last month. It&rsquo;s all approved, so we&rsquo;re getting
                started this week.
              </p>
              <p>
                Same as always, I&rsquo;m your first call if anything comes up.
                What I need from you is access to the Instagram account and
                whatever&rsquo;s left of the brand photo library. The access
                request is already on its way.
              </p>
              <p>
                While that comes across, Jordan is pulling a baseline on the
                current channels so we&rsquo;re not asking you things we can
                work out ourselves.
              </p>
              <p>I&rsquo;ll come back next week with the first content plan.</p>
              <p>Dana</p>
            </Callout>

            <Callout label="New client, standard engagement">
              <p>Hi Glen,</p>
              <p>
                I&rsquo;m following up on the SEO and Google Ads work you
                recently signed up for with Web Wizards. I&rsquo;m Dana
                Whitfield, your Account Manager, and I&rsquo;ll be your main
                point of contact from here. You&rsquo;ll also hear from Jordan
                Ellis, who leads the SEO work day to day.
              </p>
              <p>
                To get started we need three things from you this week: access
                to Google Analytics, Search Console and the Ads account, your
                logo files and brand guidelines if you have them, and
                confirmation of who signs off on content.
              </p>
              <p>
                While we wait on those, we&rsquo;ll be reviewing your site, your
                rankings and your competitors, so we come to the kickoff with a
                point of view rather than a list of questions.
              </p>
              <p>
                I&rsquo;ll send over a few times for a 30-minute kickoff call
                next week.
              </p>
              <p>Dana</p>
            </Callout>

            <Callout label="Simple engagement, no kickoff call">
              <p>Hi Tom,</p>
              <p>
                I&rsquo;m following up on the website SEO work you recently
                approved with Web Wizards. I&rsquo;m Dana Whitfield and
                I&rsquo;ll be your contact for this one.
              </p>
              <p>
                The only thing I need right now is access to the website CMS.
                The request has already gone through.
              </p>
              <p>
                For a project this size I don&rsquo;t think we need a call, but
                if you&rsquo;d rather talk it through, just say and I&rsquo;ll
                set one up.
              </p>
              <p>You&rsquo;ll hear from me once the first draft is ready.</p>
              <p>Dana</p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="next"
            marker="04"
            title="Then What?"
            intro={
              <p>
                The email has worked if the client can answer four questions
                without having to reply and ask: who am I dealing with, what
                happens next, what do you need from me, and what will I see
                first.
              </p>
            }
          >
            <NextModules
              targets={[
                { section: "client-onboarding", entry: "client-kickoff" },
                { section: "client-onboarding", entry: "access-assets" },
                { section: "templates-resources", entry: "internal-service-brief" },
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
