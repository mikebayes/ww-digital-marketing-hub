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
import type { ContactParticipation } from "@/lib/intake/types";
import { isOpenForClient, isVisibleToClient } from "@/lib/intake/public";
import { clientIntakeUrl, resolveOrigin } from "@/lib/intake/token";
import { addContactAction, removeContactAction } from "../../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Client Access" };

const COLUMNS = [
  { label: "Name", width: "24%" },
  { label: "Email", width: "28%" },
  { label: "Status", width: "18%" },
  { label: "Last activity", width: "18%" },
  { label: "", align: "right" as const },
];

const PARTICIPATION: Record<
  ContactParticipation,
  { label: string; tone: "quiet" | "live" | "teal" }
> = {
  not_started: { label: "Not started", tone: "quiet" },
  in_progress: { label: "In progress", tone: "live" },
  submitted: { label: "Submitted", tone: "teal" },
};

/**
 * Who the questionnaire is for, and the link they use.
 *
 * This list is now the gate. The link opens an email prompt, and only an
 * address recorded here gets past it — so removing somebody from this table
 * locks them out, including from a browser they already used.
 *
 * Everyone here works on the same questionnaire. They are contacts, not
 * respondents: there is one set of answers between them, and the status column
 * says how far each person has got with it rather than implying each has their
 * own copy.
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
            ? "Send this one link to everyone below. Opening it asks for an email address, and only the people in this list can get past that."
            : live
              ? "The questionnaire is closed, so the link is read-only."
              : "This link does not work yet. It starts working the moment you make the questionnaire live."}
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
            Nobody can open this questionnaire yet. Add the people at{" "}
            {intake.client.name} who should answer it.
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
                  <Pill tone={PARTICIPATION[contact.participation].tone}>
                    {PARTICIPATION[contact.participation].label}
                  </Pill>
                  {contact.is_primary && (
                    <span className="label ml-2 text-muted">Primary</span>
                  )}
                </td>
                <td className={cellClass}>
                  {contact.last_activity_at ? (
                    <ShortDate value={contact.last_activity_at} />
                  ) : (
                    <span className="text-muted">&mdash;</span>
                  )}
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
          They enter this address to get in — no password, and nothing is
          emailed from here. Everyone added works on the same questionnaire and
          can see and change what the others have answered. Removing someone
          takes effect straight away, even if they are already in it.
        </p>
      </Panel>
    </div>
  );
}
