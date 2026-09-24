"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  issueSession,
  readSession,
} from "@/lib/intake/client-session";
import {
  findApprovedContact,
  markContactActive,
  markContactSubmitted,
  resolveSessionContact,
  saveClientAnswers,
} from "@/lib/intake/public-queries";
import type { AnswerValue } from "@/lib/intake/types";

/**
 * Everything a client contact can do.
 *
 * All of it keyed by the token from the form rather than an intake id, so a
 * browser can only ever address the questionnaire it was sent, and all of it
 * re-derives who is answering from the signed session rather than from
 * anything the page posted. A contact id in a form field would be a contact
 * id anyone could change.
 */

function collectAnswers(formData: FormData): Record<string, AnswerValue> {
  const answers: Record<string, AnswerValue> = {};

  for (const key of new Set(formData.keys())) {
    if (!key.startsWith("answer:")) continue;
    const questionId = key.slice("answer:".length);
    const values = formData.getAll(key).map(String);
    answers[questionId] = values.length > 1 ? values : (values[0] ?? null);
  }

  return answers;
}

/** The active contact, or null. Never trusts the request body. */
async function activeContact(token: string) {
  const store = await cookies();
  const session = await readSession(store.get(SESSION_COOKIE)?.value);
  return resolveSessionContact(token, session);
}

/* -------------------------------------------------------------------------- */

/**
 * The email gate.
 *
 * Checked against the contacts recorded for this questionnaire, server-side.
 * A wrong address and an address belonging to a different questionnaire fail
 * identically: saying which addresses are approved would hand a stranger half
 * the credential, and the other half is in the URL they already have.
 */
export async function enterAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const email = String(formData.get("email") ?? "");

  const match = await findApprovedContact(token, email);
  if (!match) {
    redirect(`/intake/${token}?denied=1`);
  }

  const store = await cookies();
  store.set(
    SESSION_COOKIE,
    await issueSession({
      intakeId: match.intakeId,
      contactId: match.contact.id,
    }),
    { ...SESSION_COOKIE_OPTIONS, secure: process.env.NODE_ENV === "production" },
  );

  await markContactActive(match.contact.id, { started: true });

  revalidatePath(`/intake/${token}`);
  redirect(`/intake/${token}`);
}

/** Hand the questionnaire to a colleague on the same machine. */
export async function switchContactAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect(`/intake/${token}`);
}

/* -------------------------------------------------------------------------- */

export async function saveProgressAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");

  const active = await activeContact(token);
  if (!active) redirect(`/intake/${token}`);

  await saveClientAnswers(token, collectAnswers(formData), active.contact.id);

  revalidatePath(`/intake/${token}`);
  redirect(`/intake/${token}?saved=1`);
}

/**
 * "Submit responses".
 *
 * Saves, marks this person as having sent theirs, and changes nothing for
 * anybody else. The questionnaire stays live: one contact submitting used to
 * close it for the whole client, which meant the second person to open the
 * link got a thank-you page for work they had not done.
 *
 * Lands on its own route rather than back here with a flag. A Server Action
 * redirecting to the path it was posted from does not reliably carry a query
 * string, and the confirmation is a screen rather than a banner anyway.
 */
export async function submitResponsesAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");

  const active = await activeContact(token);
  if (!active) redirect(`/intake/${token}`);

  await saveClientAnswers(token, collectAnswers(formData), active.contact.id);
  await markContactSubmitted(active.contact.id);

  /*
   * No revalidatePath here. Revalidating the route this action was posted from
   * and then redirecting away raced: the refresh of the current page won and
   * the browser stayed on the questionnaire, having saved and submitted
   * silently. Both routes are force-dynamic, so there is nothing cached to
   * invalidate anyway.
   */
  redirect(`/intake/${token}/submitted`);
}
