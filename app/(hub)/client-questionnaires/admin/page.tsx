import type { Metadata } from "next";
import {
  AdminHeader,
  AdminPage,
  AdminTable,
  Empty,
  Pill,
  RowLink,
  cellClass,
  rowClass,
} from "@/components/admin/ui";
import { PrimaryAction, ShortDate } from "@/components/intake/ui";
import { serviceSummary } from "@/lib/intake/admin";
import { countArchivedIntakes, listIntakes } from "@/lib/intake/queries";
import { STATUS_LABELS } from "@/lib/intake/status";
import type { IntakeStatus } from "@/lib/intake/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Client Questionnaires",
  description:
    "Create, prepare, send and review client onboarding questionnaires.",
};

/** Status, compact. Live work reads loudest; finished work recedes. */
export function StatusPill({ status }: { status: IntakeStatus }) {
  const tone =
    status === "complete"
      ? "teal"
      : status === "sent" || status === "in_progress"
        ? "live"
        : status === "submitted" || status === "reviewed"
          ? "neutral"
          : "quiet";
  return <Pill tone={tone}>{STATUS_LABELS[status]}</Pill>;
}

const COLUMNS = [
  { label: "Client", width: "22%" },
  { label: "Service", width: "18%" },
  { label: "Account Manager", width: "16%" },
  { label: "Status", width: "14%" },
  { label: "Sent" },
  { label: "Submitted" },
  { label: "Updated" },
];

export default async function ClientQuestionnairesPage() {
  const [intakes, archived] = await Promise.all([
    listIntakes(),
    countArchivedIntakes(),
  ]);

  return (
    <AdminPage>
      <AdminHeader
        title="Client Questionnaires"
        subtitle="Create, prepare, send and review client onboarding questionnaires."
        actions={
          <PrimaryAction href="/client-questionnaires/admin/new">
            Create questionnaire
          </PrimaryAction>
        }
      />

      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-[0.875rem] text-slate">
          {intakes.length === 0
            ? "No questionnaires yet."
            : `${intakes.length} questionnaire${intakes.length === 1 ? "" : "s"}.`}
        </p>
        {archived > 0 && (
          <p className="label text-muted">
            {archived} archived, not shown
          </p>
        )}
      </div>

      <div className="mt-4">
        {intakes.length === 0 ? (
          <div className="border border-rule bg-surface">
            <Empty>
              Create the first questionnaire to prepare a client for onboarding.
            </Empty>
          </div>
        ) : (
          <AdminTable columns={COLUMNS}>
            {intakes.map((intake) => (
              <tr key={intake.id} className={rowClass}>
                <th scope="row" className="px-4 py-3.5 align-middle">
                  <RowLink href={`/client-questionnaires/admin/${intake.id}`}>
                    {intake.client?.name ?? "Unnamed client"}
                  </RowLink>
                </th>
                <td className={cellClass}>{serviceSummary(intake.services)}</td>
                <td className={cellClass}>
                  {intake.account_manager_name || (
                    <span className="text-muted">&mdash;</span>
                  )}
                </td>
                <td className="px-4 py-3.5 align-middle">
                  <StatusPill status={intake.status} />
                </td>
                <td className={cellClass}>
                  <ShortDate value={intake.sent_at} />
                </td>
                <td className={cellClass}>
                  <ShortDate value={intake.submitted_at} />
                </td>
                <td className={cellClass}>
                  <ShortDate value={intake.updated_at} />
                </td>
              </tr>
            ))}
          </AdminTable>
        )}
      </div>
    </AdminPage>
  );
}
