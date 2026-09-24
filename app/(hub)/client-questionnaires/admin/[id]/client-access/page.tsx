import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  AdminTable,
  Empty,
  Panel,
  Pill,
  cellClass,
  rowClass,
} from "@/components/admin/ui";
import { CopyLink } from "@/components/intake/CopyLink";
import {
  PrimaryAction,
  SecondaryAction,
  ShortDate,
  inputClass,
} from "@/components/intake/ui";
import { getIntake, listContacts } from "@/lib/intake/queries";
import { isOpenForClient, isVisibleToClient } from "@/lib/intake/public";
import { clientIntakeUrl, resolveOrigin } from "@/lib/intake/token";
import { addContactAction, removeContactAction } from "../../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Client Access" };

const COLUMNS = [
  { label: "Name", width: "26%" },
  { label: "Email", width: "30%" },
  { label: "Role", width: "16%" },
  { label: "Added", width: "16%" },
  { label: "", align: "right" as const },
];

/**
 * Who the questionnaire is for, and the link they use.
 *
 * Contacts are a record, not a gate. The public route still authenticates with
 * the token alone, so adding someone here changes who we chase and who we
 * address the email to — it does not change who can open the link. Saying so
 * on the screen matters more than it might seem: an admin screen listing
 * "approved" people implies a door, and there is not one yet.
 */
export default async function ClientAccessTab({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const intake = await getIntake(id);
  if (!intake) notFound();

  const contacts = await listContacts(id);
  const base = `/client-questionnaires/admin/${id}`;

  const requestHeaders = await headers();
  const clientUrl = clientIntakeUrl(
    resolveOrigin(
      requestHeaders.get("host"),
      requestHeaders.get("x-forwarded-proto"),
    ),
    intake.public_token,
  );

  const live = isVisibleToClient(intake.status);
  const open = isOpenForClient(intake.status);

  return (
    <div className="space-y-6">
      <Panel
        title="Client questionnaire link"
        action={
          <Pill tone={open ? "live" : live ? "neutral" : "quiet"}>
            {open ? "Open to the client" : live ? "Read only" : "Not yet live"}
          </Pill>
        }
      >
        <div className="@container">
          <CopyLink url={clientUrl} />
        </div>

        <p className="mt-4 max-w-2xl text-[0.875rem] leading-relaxed text-slate">
          {open
            ? "The client can open this link and answer. It never asks them to sign in."
            : live
              ? "The client can still open this link, but the questionnaire is closed to further edits."
              : "This link is not live yet. It starts working when the questionnaire is marked sent, and returns a 404 until then."}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <SecondaryAction href={`/client-questionnaires/admin/preview/${id}`}>
            Preview client questionnaire
          </SecondaryAction>
        </div>
      </Panel>

      <Panel title="Client contacts" padded={contacts.length === 0}>
        {contacts.length === 0 ? (
          <Empty>
            No contacts recorded. Add the person at{" "}
            {intake.client.name} who will answer this.
          </Empty>
        ) : (
          <AdminTable columns={COLUMNS} minWidth="44rem">
            {contacts.map((contact) => (
              <tr key={contact.id} className={rowClass}>
                <th
                  scope="row"
                  className="px-4 py-3.5 align-middle text-[0.9375rem] font-semibold text-charcoal"
                >
                  {contact.name}
                </th>
                <td className={cellClass}>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-teal-ink underline underline-offset-2"
                  >
                    {contact.email}
                  </a>
                </td>
                <td className="px-4 py-3.5 align-middle">
                  {contact.is_primary ? (
                    <Pill tone="teal">Primary</Pill>
                  ) : (
                    <Pill tone="quiet">Contact</Pill>
                  )}
                </td>
                <td className={cellClass}>
                  <ShortDate value={contact.created_at} />
                </td>
                <td className="px-4 py-3.5 text-right align-middle">
                  <form action={removeContactAction} className="inline">
                    <input type="hidden" name="intake_id" value={id} />
                    <input type="hidden" name="contact_id" value={contact.id} />
                    <button
                      type="submit"
                      className="label text-muted underline underline-offset-2 transition-colors hover:text-charcoal"
                    >
                      Remove
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </AdminTable>
        )}
      </Panel>

      <Panel title="Add a client contact">
        {error === "contact" && (
          <p className="mb-4 border-l-2 border-teal bg-teal-tint px-4 py-3 text-[0.875rem] text-charcoal">
            A name and an email address are both needed.
          </p>
        )}

        <form action={addContactAction} className="flex flex-wrap items-end gap-4">
          <input type="hidden" name="intake_id" value={id} />

          <div className="min-w-[12rem] flex-1">
            <label htmlFor="contact-name" className="label block text-muted">
              Name
            </label>
            <input
              id="contact-name"
              name="name"
              required
              className={`${inputClass} mt-2`}
            />
          </div>

          <div className="min-w-[14rem] flex-1">
            <label htmlFor="contact-email" className="label block text-muted">
              Email
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              className={`${inputClass} mt-2`}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 pb-3">
            <input
              type="checkbox"
              name="is_primary"
              className="h-4 w-4 accent-[var(--color-teal-ink)]"
            />
            <span className="text-[0.875rem] text-charcoal">Primary contact</span>
          </label>

          <PrimaryAction>Add contact</PrimaryAction>
        </form>

        <p className="mt-5 max-w-2xl text-[0.875rem] leading-relaxed text-slate">
          Recorded for our own reference. Anyone holding the link can open the
          questionnaire — restricting it to these addresses is separate work we
          have not done yet, so treat the link as the credential and send it
          only to the people above.
        </p>
      </Panel>
    </div>
  );
}
