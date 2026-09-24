import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Panel } from "@/components/admin/ui";
import {
  PrimaryAction,
  SecondaryAction,
  inputClass,
  textareaClass,
} from "@/components/intake/ui";
import { billableServices, questionnaireTitle } from "@/lib/intake/admin";
import { getIntake, listServices } from "@/lib/intake/queries";
import { STATUS_LABELS } from "@/lib/intake/status";
import { saveSettingsAction, setArchivedAction } from "../../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Settings" };

/**
 * What can be changed about a questionnaire after it exists.
 *
 * Narrow on purpose. The public token is not editable — it is the client's
 * credential, and a link already sent would stop working. Status is not
 * editable either: it moves through the lifecycle from the Overview tab, and a
 * dropdown here would be a second way to set it that skipped the rules.
 */
export default async function SettingsTab({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;

  const intake = await getIntake(id);
  if (!intake) notFound();

  const services = await listServices();
  const selectable = billableServices(services);
  const selected = new Set(intake.services.map((service) => service.id));
  const archived = Boolean(intake.archived_at);

  return (
    <div className="max-w-[52rem] space-y-6">
      {saved && (
        <p
          className="label border-l-2 border-teal bg-teal-tint px-4 py-3 text-teal-ink"
          role="status"
        >
          Settings saved
        </p>
      )}

      <form action={saveSettingsAction} className="space-y-6">
        <input type="hidden" name="intake_id" value={id} />
        <input type="hidden" name="services_present" value="1" />

        <Panel title="Questionnaire">
          <div className="space-y-5">
            <div>
              <label htmlFor="client" className="label block text-muted">
                Client
              </label>
              <input
                id="client"
                value={intake.client.name}
                readOnly
                className={`${inputClass} mt-2 bg-neutral-tint text-muted`}
              />
              <p className="mt-2 text-[0.8125rem] text-muted">
                The client a questionnaire belongs to does not change. Create a
                new questionnaire instead.
              </p>
            </div>

            <div>
              <label htmlFor="title" className="label block text-muted">
                Title
              </label>
              <input
                id="title"
                name="title"
                defaultValue={intake.title ?? ""}
                placeholder={questionnaireTitle(
                  { title: null },
                  intake.services,
                )}
                className={`${inputClass} mt-2`}
              />
              <p className="mt-2 text-[0.8125rem] text-muted">
                Optional. Left empty, it is named after the services.
              </p>
            </div>

            <div>
              <label
                htmlFor="account_manager_name"
                className="label block text-muted"
              >
                Account Manager
              </label>
              <input
                id="account_manager_name"
                name="account_manager_name"
                defaultValue={intake.account_manager_name ?? ""}
                className={`${inputClass} mt-2`}
              />
            </div>

            <div>
              <label htmlFor="intro_text" className="label block text-muted">
                Introduction shown to the client
              </label>
              <textarea
                id="intro_text"
                name="intro_text"
                defaultValue={intake.intro_text ?? ""}
                rows={4}
                className={`${textareaClass} mt-2`}
              />
              <p className="mt-2 text-[0.8125rem] text-muted">
                Optional. Appears above the first question. Left empty, the
                standard wording is used.
              </p>
            </div>
          </div>
        </Panel>

        <Panel title="Services">
          <fieldset>
            <legend className="sr-only">Services</legend>
            <div className="space-y-3">
              {selectable.map((service) => (
                <label
                  key={service.id}
                  className="flex cursor-pointer items-start gap-3"
                >
                  <input
                    type="checkbox"
                    name="service_ids"
                    value={service.id}
                    defaultChecked={selected.has(service.id)}
                    className="mt-[0.2rem] h-4 w-4 accent-[var(--color-teal-ink)]"
                  />
                  <span className="text-[0.9375rem] text-charcoal">
                    {service.name}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <p className="mt-4 text-[0.8125rem] leading-relaxed text-muted">
            Adding a service copies its standard questions in. Removing one
            excludes its questions rather than deleting them, so any answers
            already given are kept.
          </p>
        </Panel>

        <div className="flex flex-wrap items-center gap-3">
          <PrimaryAction>Save changes</PrimaryAction>
          <SecondaryAction href={`/client-questionnaires/admin/${id}`}>
            Cancel
          </SecondaryAction>
        </div>
      </form>

      <Panel title="Status">
        <p className="text-[0.9375rem] text-charcoal">
          {STATUS_LABELS[intake.status]}
        </p>
        <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted">
          Status moves from the Overview tab, which only offers the moves the
          questionnaire can actually make from where it is.
        </p>
      </Panel>

      <Panel title={archived ? "Archived" : "Archive"}>
        <p className="max-w-xl text-[0.875rem] leading-relaxed text-slate">
          {archived
            ? "This questionnaire is hidden from the list. Nothing has been deleted."
            : "Hides this questionnaire from the list without deleting it. A questionnaire holds what a client told us and what we agreed to do about it, so it is archived rather than removed."}
        </p>
        <form action={setArchivedAction} className="mt-4">
          <input type="hidden" name="intake_id" value={id} />
          <input type="hidden" name="archived" value={archived ? "0" : "1"} />
          <SecondaryAction>
            {archived ? "Restore to the list" : "Archive questionnaire"}
          </SecondaryAction>
        </form>
      </Panel>
    </div>
  );
}
