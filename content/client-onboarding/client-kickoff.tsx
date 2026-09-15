import Link from "next/link";
import {
  PageHeader,
  Section,
  RuleBlock,
  Callout,
  Checklist,
  NextModules,
} from "@/components/hub/primitives";
import { OnThisPage, type TocItem } from "@/components/hub/OnThisPage";

const toc: TocItem[] = [
  { id: "before", marker: "01", title: "Before the Kickoff" },
  { id: "confirm", marker: "02", title: "What to Confirm" },
  { id: "after", marker: "03", title: "After the Kickoff" },
  { id: "done", marker: "04", title: "Kickoff Is Complete When" },
  { id: "next", marker: "05", title: "Then What?" },
];

export default function ClientKickoff() {
  return (
    <div className="px-6 pt-10 pb-4 md:px-12 lg:px-16 lg:pt-14">
      <PageHeader
        title="Client Kickoff"
        lede="Confirm the things that matter, agree what happens first, and get on with the work. A call is usually worth it — but for a small or simple account, the same things can be confirmed by email."
        breadcrumb={[
          { label: "Hub", href: "/" },
          { label: "Client Onboarding", href: "/client-onboarding" },
          { label: "Client Kickoff" },
        ]}
        meta={[
          { label: "Led by", value: "Account Manager" },
          { label: "Format", value: "Call or email" },
          { label: "Timing", value: "Before delivery starts" },
          { label: "Version", value: "0.1 · Sept 2026" },
        ]}
      />

      <div className="mt-12 grid gap-12 min-[1400px]:grid-cols-[minmax(0,1fr)_var(--spacing-toc)] min-[1400px]:gap-14">
        <article className="@container min-w-0 space-y-12">
          {/* ---------------------------------------------------------------- */}
          <Section
            id="before"
            marker="01"
            title="Before the Kickoff"
            intro={
              <p>
                Turn up knowing the account. The call is for the things only the
                client can tell us.
              </p>
            }
          >
            <Checklist
              items={[
                "The Internal Service Brief has been read by everyone attending",
                "Obvious account, competitor and performance research is done",
                "The questions that genuinely need client input are written down",
                "Access and asset requests are already out",
              ]}
            />

            <Callout label="The rule">
              <p>
                <strong>
                  Do not use the client kickoff to discover information we could
                  have found ourselves.
                </strong>
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="confirm"
            marker="02"
            title="What to Confirm"
            intro={
              <p>
                The Account Manager leads. The assigned specialist attends, plus
                the service lead where relevant. The salesperson joins only if
                there is a specific reason.
              </p>
            }
          >
            <RuleBlock
              items={[
                {
                  title: "Goals and priorities",
                  body: "What matters most right now, and what they want to see happen first.",
                },
                {
                  title: "Scope",
                  body: "Clear up anything they have understood differently from what was sold. Do not read the proposal back to them.",
                },
                {
                  title: "People and approvals",
                  body: "Primary working contact, other stakeholders, who approves work, and who only needs visibility.",
                },
                {
                  title: "Communication",
                  body: "Preferred channel, what a normal response time looks like, and any recurring meeting actually worth holding.",
                },
                {
                  title: "Access and assets",
                  body: (
                    <>
                      What is still missing, and who is chasing it. Detail lives
                      in{" "}
                      <Link href="/client-onboarding/access-assets">
                        Access &amp; Assets
                      </Link>
                      .
                    </>
                  ),
                },
                {
                  title: "The first 30 days",
                  body: "First priorities, first actions, the first thing the client will see, and any deadline or dependency in the way. A short list, not a plan document.",
                },
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="after"
            marker="03"
            title="After the Kickoff"
            intro={
              <p>
                No minutes. The Account Manager writes down what changed and
                keeps things moving.
              </p>
            }
          >
            <Checklist
              items={[
                "Material changes or decisions recorded against the project",
                "Outstanding items given an owner",
                "Immediate priorities updated if the conversation moved them",
                "Service-specific onboarding continues",
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section id="done" marker="04" title="Kickoff Is Complete When">
            <Checklist
              items={[
                "Goals and priorities are confirmed",
                "Scope misunderstandings are resolved",
                "Contacts and the approval path are understood",
                "Outstanding access and assets have owners",
                "Immediate next steps are clear",
              ]}
            />

            <Callout label="Keep it lightweight" tone="charcoal">
              <p>
                <strong>
                  The kickoff is not a presentation. It is a confirmation
                  conversation.
                </strong>{" "}
                No deck, no agenda document, no ceremony. If a call would add
                nothing for a particular client, confirm the same things another
                way — but confirm them.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section id="next" marker="05" title="Then What?">
            <NextModules
              targets={[
                { section: "client-onboarding", entry: "access-assets" },
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
