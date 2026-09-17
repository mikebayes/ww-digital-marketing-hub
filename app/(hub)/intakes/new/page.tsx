import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/hub/primitives";
import {
  Field,
  inputClass,
  PrimaryAction,
  SecondaryAction,
} from "@/components/intake/ui";
import { listClients, listServices } from "@/lib/intake/queries";
import { createIntakeAction } from "../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Create intake" };

/**
 * Three steps on one page.
 *
 * A wizard would need its own state and three round trips to collect a client,
 * a service list and a name. One form does it, and the Account Manager can see
 * the whole decision at once.
 */
export default async function NewIntakePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [clients, services] = await Promise.all([listClients(), listServices()]);
  const params = await searchParams;
  const selectable = services.filter((s) => s.slug !== "common");

  return (
    <div className="px-6 pt-10 pb-4 md:px-12 lg:px-16 lg:pt-14">
      <PageHeader
        title="Create Intake"
        lede="Pick the client, pick the services, and the standard questions for those services are copied into the intake ready to review."
        breadcrumb={[
          { label: "Hub", href: "/" },
          { label: "Intakes", href: "/intakes" },
          { label: "Create Intake" },
        ]}
      />

      {params.error === "client" && (
        <p className="mt-8 border-l-2 border-charcoal bg-surface px-4 py-3 text-[0.9375rem] text-charcoal">
          Choose an existing client or give the new one a name.
        </p>
      )}

      <form action={createIntakeAction} className="mt-12 max-w-2xl space-y-12">
        <Section id="client" marker="01" title="Client">
          <Field label="Existing client" htmlFor="client_id">
            <select id="client_id" name="client_id" className={inputClass} defaultValue="">
              <option value="">New client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Or add a new one"
            hint="Only used if no existing client is selected above."
            htmlFor="new_client_name"
          >
            <div className="space-y-3">
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
          </Field>
        </Section>

        <Section
          id="services"
          marker="02"
          title="Services"
          intro={
            <p>
              The Common question set is always included. Pick the services this
              engagement covers on top of it.
            </p>
          }
        >
          <ul className="border-t border-rule">
            {selectable.map((service) => (
              <li key={service.id} className="border-b border-rule">
                <label className="flex cursor-pointer items-baseline gap-3 py-4">
                  <input
                    type="checkbox"
                    name="service_ids"
                    value={service.id}
                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-teal-ink)]"
                  />
                  <span className="text-[0.9375rem] font-medium text-charcoal">
                    {service.name}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="am" marker="03" title="Account Manager">
          <Field label="Who is running this onboarding?" htmlFor="account_manager_name">
            <input
              id="account_manager_name"
              name="account_manager_name"
              type="text"
              placeholder="Name"
              className={inputClass}
            />
          </Field>
        </Section>

        <div className="flex flex-wrap items-center gap-4 border-t border-rule pt-8">
          <PrimaryAction>Create intake</PrimaryAction>
          <SecondaryAction href="/intakes">Cancel</SecondaryAction>
        </div>
      </form>
    </div>
  );
}
