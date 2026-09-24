import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ClientShell } from "@/components/intake/ClientShell";
import { SESSION_COOKIE, readSession } from "@/lib/intake/client-session";
import {
  getPublicIntake,
  resolveSessionContact,
} from "@/lib/intake/public-queries";

export const dynamic = "force-dynamic";

/**
 * The confirmation, after a contact submits their responses.
 *
 * Its own route rather than a flag on the questionnaire. A Server Action
 * redirecting to the path it was posted from does not reliably carry a query
 * string, and this should be a screen anyway — a small banner above the
 * questions did not read as "done", it read as "nothing happened".
 *
 * Deliberately not a wall. The contact can walk straight back in from here,
 * and opening the plain link later takes them into the questionnaire rather
 * than to this page: submitting says this person has sent what they have, not
 * that the questionnaire is closed.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const intake = await getPublicIntake(token);

  return {
    title: {
      absolute: intake
        ? `${intake.clientName} | ${intake.title} | Web Wizards`
        : "Web Wizards",
    },
    robots: { index: false, follow: false },
  };
}

export default async function SubmittedPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const intake = await getPublicIntake(token);
  if (!intake) notFound();

  /*
   * The same gate as the questionnaire. Somebody who has not identified
   * themselves should not be told that responses were submitted, or whose.
   */
  const store = await cookies();
  const active = await resolveSessionContact(
    token,
    await readSession(store.get(SESSION_COOKIE)?.value),
  );
  if (!active) redirect(`/intake/${token}`);

  return (
    <ClientShell clientName={intake.clientName}>
      <h1 className="text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-balance text-charcoal">
        Thanks, your responses have been submitted.
      </h1>

      <span aria-hidden className="mt-7 block h-px w-16 bg-teal" />

      <p className="mt-7 max-w-2xl text-[1.0625rem] leading-relaxed text-slate">
        You can return to this questionnaire using the same link if you need to
        make changes while it remains open.
      </p>

      <Link
        href={`/intake/${token}`}
        className="label mt-9 inline-flex items-center gap-3 border border-rule-strong px-5 py-3.5 text-charcoal transition-colors hover:border-charcoal"
      >
        Back to the questionnaire
      </Link>
    </ClientShell>
  );
}
