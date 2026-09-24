import { notFound } from "next/navigation";
import { Tabs } from "@/components/admin/Tabs";
import { AdminHeader, AdminPage } from "@/components/admin/ui";
import { StatusPill } from "../page";
import { serviceSummary } from "@/lib/intake/admin";
import { getIntake } from "@/lib/intake/queries";

export const dynamic = "force-dynamic";

/**
 * The shell every questionnaire tab renders inside.
 *
 * The header and the tab strip live here rather than in each tab so they
 * cannot drift, and so moving between tabs does not repaint the identity of
 * the thing you are working on. The client name is the title because that is
 * what an Account Manager is looking for; the service is the subtitle because
 * it is how they tell two questionnaires for the same client apart.
 */
export default async function QuestionnaireLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const intake = await getIntake(id);
  if (!intake) notFound();

  const base = `/client-questionnaires/admin/${id}`;

  return (
    <AdminPage>
      <AdminHeader
        eyebrow="All questionnaires"
        eyebrowHref="/client-questionnaires/admin"
        title={intake.client.name}
        subtitle={serviceSummary(intake.services)}
        status={<StatusPill status={intake.status} />}
      />

      <div className="mt-6">
        <Tabs
          items={[
            { href: base, label: "Overview" },
            { href: `${base}/questions`, label: "Questions" },
            { href: `${base}/client-access`, label: "Client Access" },
            /*
             * No count here. "Responses 47" read as forty-seven client
             * responses when it was the number of unanswered questions, most
             * of them optional. A number that could mean several things is
             * worse on a tab than no number at all.
             */
            { href: `${base}/responses`, label: "Responses" },
            { href: `${base}/settings`, label: "Settings" },
          ]}
        />
      </div>

      <div className="mt-8">{children}</div>
    </AdminPage>
  );
}
