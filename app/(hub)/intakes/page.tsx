import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/hub/primitives";
import { EmptyState, PrimaryAction, ShortDate, StatusMark } from "@/components/intake/ui";
import { listIntakes } from "@/lib/intake/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Intakes",
  description: "Client onboarding questionnaires.",
};

/**
 * The list. A table rather than a grid of cards: these rows are scanned for a
 * client name and a status, which is what a table is for.
 */
export default async function IntakesPage() {
  const intakes = await listIntakes();

  return (
    <div className="px-6 pt-10 pb-4 md:px-12 lg:px-16 lg:pt-14">
      <PageHeader
        title="Intakes"
        lede="Client onboarding questionnaires. Prepare the questions, send the client a link, then review what comes back."
        breadcrumb={[{ label: "Hub", href: "/" }, { label: "Intakes" }]}
      />

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[0.9375rem] text-slate">
          {intakes.length === 0
            ? "No intakes yet."
            : `${intakes.length} intake${intakes.length === 1 ? "" : "s"}.`}
        </p>
        <PrimaryAction href="/intakes/new">Create intake</PrimaryAction>
      </div>

      <div className="mt-8">
        {intakes.length === 0 ? (
          <EmptyState>
            Create the first intake to prepare a client questionnaire.
          </EmptyState>
        ) : (
          <div className="overflow-x-auto border border-rule bg-surface">
            <table className="w-full min-w-[56rem] table-fixed border-collapse text-left">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[20%]" />
                <col className="w-[16%]" />
                <col className="w-[14%]" />
                <col />
                <col />
                <col />
              </colgroup>
              <thead>
                <tr className="border-b border-rule-strong bg-neutral-tint">
                  {["Client", "Services", "Account Manager", "Status", "Sent", "Submitted", "Updated"].map(
                    (heading) => (
                      <th key={heading} scope="col" className="px-5 py-3.5 align-bottom">
                        <span className="label text-muted">{heading}</span>
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {intakes.map((intake) => (
                  <tr key={intake.id} className="border-b border-rule last:border-b-0">
                    <th scope="row" className="px-5 py-4 align-top">
                      <Link
                        href={`/intakes/${intake.id}`}
                        className="text-[0.9375rem] font-semibold text-charcoal hover:text-teal-ink"
                      >
                        {intake.client?.name ?? "Unnamed client"}
                      </Link>
                    </th>
                    <td className="px-5 py-4 align-top text-[0.875rem] leading-relaxed text-slate">
                      {intake.services
                        .filter((s) => s.slug !== "common")
                        .map((s) => s.name)
                        .join(", ") || "Common only"}
                    </td>
                    <td className="px-5 py-4 align-top text-[0.875rem] text-slate">
                      {intake.account_manager_name || <span className="text-muted">—</span>}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <StatusMark status={intake.status} />
                    </td>
                    <td className="px-5 py-4 align-top text-[0.875rem] text-slate">
                      <ShortDate value={intake.sent_at} />
                    </td>
                    <td className="px-5 py-4 align-top text-[0.875rem] text-slate">
                      <ShortDate value={intake.submitted_at} />
                    </td>
                    <td className="px-5 py-4 align-top text-[0.875rem] text-slate">
                      <ShortDate value={intake.updated_at} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
