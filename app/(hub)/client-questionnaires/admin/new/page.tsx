import type { Metadata } from "next";
import { AdminHeader, AdminPage, Panel } from "@/components/admin/ui";
import {
  PrimaryAction,
  SecondaryAction,
  inputClass,
} from "@/components/intake/ui";
import { billableServices } from "@/lib/intake/admin";
import { listClients, listServices } from "@/lib/intake/queries";
import { createQuestionnaireAction } from "../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Create questionnaire" };

/**
 * Three decisions on one page.
 *
 * A wizard would need its own state and three round trips to collect a client,
 * a service list and a name. One form does it, and the Account Manager can see
 * the whole decision at once.
 *
 * Nothing is built from scratch here: picking the services copies the standard
 * library for those services into the questionnaire, and customising happens
 * afterwards on the Questions tab.
 */
export default async function NewQuestionnairePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [clients, services] = await Promise.all([listClients(), listServices()]);
  const { error } = await searchParams;
  const selectable = billableServices(services);

  return (
    <AdminPage>
      <AdminHeader
        eyebrow="All questionnaires"
        eyebrowHref="/client-questionnaires/admin"
        title="Create questionnaire"
        subtitle="Pick the client and the services. The standard questions for those services are copied in, ready to review."
      />

      {error === "client" && (
        <p className="mt-6 max-w-2xl border-l-2 border-teal bg-teal-tint px-4 py-3 text-[0.9375rem] text-charcoal">
          Choose an existing client, or give the new one a name.
        </p>
      )}

      <form
        action={createQuestionnaireAction}
        className="mt-8 max-w-2xl space-y-6"
      >
        <Panel title="Client">
          <div className="space-y-5">
            <div>
              <label htmlFor="client_id" className="label block text-muted">
                Existing client
              </label>
              <select
                id="client_id"
                name="client_id"
                defaultValue=""
                className={`${inputClass} mt-2`}
              >
                <option value="">New client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="new_client_name" className="label block text-muted">
                Or add a new one
              </label>
              <div className="mt-2 space-y-3">
                <input
                  id="new_client_name"
                  name="new_client_name"
                  type="text"
                  placeholder="Client name"
                  className={inputClass}
                />
                <input
                  name="new_client_website"
                  type="url"
                  placeholder="https://example.com (optional)"
                  className={inputClass}
                />
              </div>
              <p className="mt-2 text-[0.8125rem] text-muted">
                Only used if no existing client is selected above.
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
            The Common question set is always included. Pick what this
            engagement covers on top of it.
          </p>
        </Panel>

        <Panel title="Account Manager">
          <label
            htmlFor="account_manager_name"
            className="label block text-muted"
          >
            Who is running this onboarding?
          </label>
          <input
            id="account_manager_name"
            name="account_manager_name"
            type="text"
            placeholder="Name"
            className={`${inputClass} mt-2`}
          />
        </Panel>

        <div className="flex flex-wrap items-center gap-3">
          <PrimaryAction>Create questionnaire</PrimaryAction>
          <SecondaryAction href="/client-questionnaires/admin">
            Cancel
          </SecondaryAction>
        </div>
      </form>
    </AdminPage>
  );
}
