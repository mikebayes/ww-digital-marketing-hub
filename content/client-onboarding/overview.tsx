import {
  PageHeader,
  Section,
  RuleBlock,
  Callout,
  Checklist,
  SplitPanels,
  DefinitionTable,
  NextModules,
} from "@/components/hub/primitives";
import { OnThisPage, type TocItem } from "@/components/hub/OnThisPage";

const toc: TocItem[] = [
  { id: "ownership", marker: "01", title: "Ownership" },
  { id: "flow", marker: "02", title: "The Onboarding Flow" },
  { id: "participants", marker: "03", title: "Who Participates" },
  { id: "done", marker: "04", title: "Definition of Done" },
  { id: "next", marker: "05", title: "Then What?" },
];

export default function ClientOnboardingOverview() {
  return (
    <div className="px-6 pt-10 pb-4 md:px-12 lg:px-16 lg:pt-14">
      <PageHeader
        title="Client Onboarding"
        lede="Onboarding runs from the moment a client approves the work to the point where the account is set up and delivery can run normally. This page is the map; each step has its own module with the detail."
        breadcrumb={[
          { label: "Hub", href: "/" },
          { label: "Client Onboarding", href: "/client-onboarding" },
          { label: "Overview" },
        ]}
        meta={[
          { label: "Owned by", value: "Account Manager" },
          { label: "Starts at", value: "Client authorization" },
          { label: "Applies to", value: "New clients & new services" },
          { label: "Version", value: "0.1 · Sept 2026" },
        ]}
      />

      <div className="mt-12 grid gap-12 min-[1400px]:grid-cols-[minmax(0,1fr)_var(--spacing-toc)] min-[1400px]:gap-14">
        <article className="@container min-w-0 space-y-12">
          {/* ---------------------------------------------------------------- */}
          <Section
            id="ownership"
            marker="01"
            title="Ownership"
            intro={
              <p>
                <strong>The Account Manager owns onboarding.</strong> That means
                keeping it moving, making sure the required work gets done,
                coordinating the team and talking to the client. It does not
                mean doing every task personally — specialists stay responsible
                for their own tactical work.
              </p>
            }
          >
            <SplitPanels
              panels={[
                {
                  label: "Owns the process",
                  title: "Account Manager",
                  tone: "dark",
                  items: [
                    "Coordinates the team and keeps onboarding moving",
                    "Communicates with the client",
                    "Tracks completion against the checklist below",
                    "Chases gaps — access, assets, answers",
                    "Escalates when something is stuck",
                  ],
                },
                {
                  label: "Own the work",
                  title: "Service Specialists",
                  tone: "light",
                  items: [
                    "Service-specific setup and configuration",
                    "Account, competitor and performance research",
                    "Platform and tracking configuration",
                    "Tactical preparation before delivery starts",
                  ],
                },
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="flow"
            marker="02"
            title="The Onboarding Flow"
            intro={
              <p>
                Roughly in order. Steps 3 to 5 usually overlap, and service
                onboarding often starts before the kickoff is finished.
              </p>
            }
          >
            <RuleBlock
              items={[
                {
                  title: "Client approves work",
                  body: "Onboarding can begin once authorization to proceed is clear — a signed proposal, written client acceptance, or written confirmation between the client and the salesperson that work is going ahead.",
                },
                {
                  title: "Internal handoff",
                  body: "Sales hands over what was sold, why the client hired us, their goals and expectations, known sensitivities and risks, and who the important stakeholders are. The Account Manager confirms there are no gaps before work starts.",
                },
                {
                  title: "Productive setup",
                  body: "Create the client and project structure, assign owners, and activate the onboarding template for the services purchased.",
                },
                {
                  title: "Access & assets",
                  body: "Request the platform access, permissions and materials the purchased services need — logos, brand guidelines, photography, creative files, historical campaign data. What is actually required varies by client and service.",
                },
                {
                  title: "Internal preparation",
                  body: "The delivery team reviews the account, existing performance, service history and obvious opportunities before speaking to the client. Arrive at kickoff informed; do not spend the client's time finding out what we could have looked up ourselves.",
                },
                {
                  title: "Client kickoff / confirmation",
                  body: "Confirm goals, priorities, roles, communication, approvals and immediate next steps. A call is usually better, but email is fine for a small or simple account where a meeting adds nothing.",
                },
                {
                  title: "Service-specific onboarding",
                  body: "The relevant service process starts — SEO, paid media, social media or a one-time project. Each has its own module and its own Productive template.",
                },
                {
                  title: "30-day plan & launch",
                  body: "Agree the immediate priorities, the first actions and the first thing the client will actually see. Keep it short. Then move into normal delivery.",
                },
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="participants"
            marker="03"
            title="Who Participates"
            intro={
              <p>
                Roles, not names. Who fills them depends on the service and who
                is assigned to the account.
              </p>
            }
          >
            <DefinitionTable
              rows={[
                {
                  term: "Internal handoff",
                  detail:
                    "Salesperson, Account Manager, assigned specialist, and service lead where relevant.",
                },
                {
                  term: "Client kickoff",
                  detail:
                    "Account Manager, assigned specialist, and service lead where relevant. The salesperson attends only where there is a reason to remain involved.",
                },
                {
                  term: "Service assignment",
                  detail:
                    "The assigned specialist depends on the service and account. SEO and paid media typically require more involvement from the service lead; social media and one-time projects are assigned based on the work required.",
                },
              ]}
            />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="done"
            marker="04"
            title="Definition of Done"
            intro={<p>Onboarding is finished when all of this is true.</p>}
          >
            <Checklist
              items={[
                "The delivery team understands the scope and the client's goals",
                "Productive is set up and ownership is assigned",
                "Required access and assets are in hand",
                "Client contacts and the approval process are known",
                "The applicable service onboarding is ready to deliver",
                "Immediate priorities are written down where the team can see them",
              ]}
            />

            <Callout label="This is a standard, not paperwork">
              <p>
                A small SEO client may not need a kickoff call. A simple
                one-time project may skip steps that add nothing. Use judgement
                on the method — but{" "}
                <strong>
                  do not skip the information or the accountability
                </strong>
                . If a step is being simplified, someone still has to be able to
                tick every line above.
              </p>
            </Callout>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section
            id="next"
            marker="05"
            title="Then What?"
            intro={
              <p>
                The detail for each step lives in its own module. This page only
                covers the shape of the process.
              </p>
            }
          >
            <NextModules
              targets={[
                { section: "client-onboarding", entry: "internal-handoff" },
                { section: "client-onboarding", entry: "productive-setup" },
                { section: "client-onboarding", entry: "access-assets" },
                { section: "client-onboarding", entry: "client-kickoff" },
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
