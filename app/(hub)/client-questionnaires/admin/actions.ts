"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addContact,
  createClientRecord,
  createIntake,
  getIntake,
  getIntakeQuestions,
  removeContact,
  setArchived,
  setIntakeServices,
  updateIntake,
  updateIntakeQuestion,
  updateIntakeSettings,
} from "@/lib/intake/queries";
import { canMarkComplete } from "@/lib/intake/admin";
import { normalizeAnswer } from "@/lib/intake/public";
import { canTransition, timestampsFor } from "@/lib/intake/status";
import type { AnswerValue, IntakeStatus } from "@/lib/intake/types";

/**
 * Every mutation the questionnaire admin makes.
 *
 * The access check is not here. It sits in lib/intake/queries.ts, where the
 * data is, because a Server Action can be dispatched at any route — including
 * the documentation pages the proxy deliberately does not match — so a check
 * in the page or the proxy alone would not cover these.
 */

const ADMIN = "/client-questionnaires/admin";

function refresh(id: string) {
  revalidatePath(ADMIN);
  revalidatePath(`${ADMIN}/${id}`, "layout");
}

/* -------------------------------------------------------------------------- */
/* Creating                                                                   */
/* -------------------------------------------------------------------------- */

export async function createQuestionnaireAction(formData: FormData) {
  const existingClientId = String(formData.get("client_id") ?? "").trim();
  const newClientName = String(formData.get("new_client_name") ?? "").trim();
  const newClientWebsite = String(formData.get("new_client_website") ?? "").trim();
  const accountManager = String(formData.get("account_manager_name") ?? "").trim();
  const serviceIds = formData.getAll("service_ids").map(String).filter(Boolean);

  let clientId = existingClientId;
  if (!clientId) {
    if (!newClientName) redirect(`${ADMIN}/new?error=client`);
    const created = await createClientRecord({
      name: newClientName,
      website: newClientWebsite || null,
    });
    clientId = created.id;
  }

  const intake = await createIntake({
    clientId,
    serviceIds,
    accountManagerName: accountManager || null,
  });

  revalidatePath(ADMIN);
  // Straight to Questions: a questionnaire that has just been built from the
  // standard library is never ready to send, and the next thing anyone does is
  // decide what to cut.
  redirect(`${ADMIN}/${intake.id}/questions`);
}

/* -------------------------------------------------------------------------- */
/* Preparing                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Save the Account Manager's pass over the questionnaire.
 *
 * Inclusion and pre-fill arrive together because they are edited together; a
 * question the AM excluded should not also silently keep a pre-fill that would
 * reappear if they re-included it, so both are written every time.
 */
export async function saveQuestionsAction(formData: FormData) {
  const intakeId = String(formData.get("intake_id") ?? "");
  if (!intakeId) return;

  const view = String(formData.get("view") ?? "");
  const questions = await getIntakeQuestions(intakeId);

  for (const question of questions) {
    /*
     * Only what was on screen. The tab shows client questions or internal
     * preparation, never both, and an absent checkbox means "not rendered"
     * rather than "unchecked" — without this, saving the internal view would
     * exclude every client question the Account Manager could not even see.
     */
    if (!formData.has(`present:${question.id}`)) continue;

    const included = formData.get(`included:${question.id}`) === "on";
    const raw = formData.getAll(`prefill:${question.id}`).map(String);

    const value: AnswerValue =
      question.field_type === "multiselect"
        ? raw.length > 0
          ? raw
          : null
        : (raw[0] ?? null);

    const notes = formData.get(`notes:${question.id}`);

    await updateIntakeQuestion(question.id, {
      included,
      prefill_answer: normalizeAnswer(question, value),
      internal_notes:
        notes === null ? question.internal_notes : String(notes).trim() || null,
    });
  }

  refresh(intakeId);

  // Back to the view they were working in, not to the default one.
  const query = new URLSearchParams({ saved: "1" });
  if (view) query.set("view", view);
  redirect(`${ADMIN}/${intakeId}/questions?${query}`);
}

/** Include or exclude one question without saving the whole screen. */
export async function toggleQuestionAction(formData: FormData) {
  const intakeId = String(formData.get("intake_id") ?? "");
  const questionId = String(formData.get("question_id") ?? "");
  const include = formData.get("include") === "1";
  if (!intakeId || !questionId) return;

  await updateIntakeQuestion(questionId, { included: include });
  refresh(intakeId);
  redirect(`${ADMIN}/${intakeId}/questions`);
}

/* -------------------------------------------------------------------------- */
/* Reviewing                                                                  */
/* -------------------------------------------------------------------------- */

/** Finalise answers and internal notes after the client has submitted. */
export async function saveResponsesAction(formData: FormData) {
  const intakeId = String(formData.get("intake_id") ?? "");
  if (!intakeId) return;

  const filter = String(formData.get("filter") ?? "");
  const questions = await getIntakeQuestions(intakeId);

  for (const question of questions) {
    /*
     * Only questions actually rendered on this pass are written. A filtered
     * view posts a subset, and treating an absent field as "cleared" would
     * wipe answers the Account Manager could not even see. The marker is
     * checked rather than the field itself, because a multiselect with nothing
     * ticked is a real answer that posts no value of its own.
     */
    if (!formData.has(`present:${question.id}`)) continue;

    const raw = formData.getAll(`final:${question.id}`).map(String);
    const value: AnswerValue =
      question.field_type === "multiselect"
        ? raw.length > 0
          ? raw
          : null
        : (raw[0] ?? null);

    const notes = formData.get(`notes:${question.id}`);

    await updateIntakeQuestion(question.id, {
      final_answer: normalizeAnswer(question, value),
      internal_notes:
        notes === null ? question.internal_notes : String(notes).trim() || null,
    });
  }

  refresh(intakeId);

  // Back to the same filtered view they were working in, not to "All".
  const query = new URLSearchParams({ saved: "1" });
  if (filter) query.set("filter", filter);
  redirect(`${ADMIN}/${intakeId}/responses?${query}`);
}

/* -------------------------------------------------------------------------- */
/* Lifecycle                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Move a questionnaire through its lifecycle.
 *
 * The transition is checked against the same table the buttons are rendered
 * from, so a stale page cannot post a move that is no longer legal.
 */
export async function setStatusAction(formData: FormData) {
  const intakeId = String(formData.get("intake_id") ?? "");
  const to = String(formData.get("to") ?? "") as IntakeStatus;
  if (!intakeId || !to) return;

  const intake = await getIntake(intakeId);
  if (!intake) return;

  if (!canTransition(intake.status, to)) {
    redirect(`${ADMIN}/${intakeId}?error=transition`);
  }

  /*
   * The completion rule, enforced where the status is written as well as in
   * the button that offers it. A client may submit with required-by-completion
   * questions unresolved — they are told to leave anything they are unsure of
   * blank — but Web Wizards cannot call the onboarding finished while we still
   * owe an answer. Not showing the button is a courtesy; this is the rule.
   */
  if (to === "complete") {
    const questions = await getIntakeQuestions(intakeId);
    if (!canMarkComplete(questions)) {
      redirect(`${ADMIN}/${intakeId}?error=followup`);
    }
  }

  await updateIntake(intakeId, { status: to, ...timestampsFor(to) });

  refresh(intakeId);
  redirect(`${ADMIN}/${intakeId}`);
}

/* -------------------------------------------------------------------------- */
/* Settings                                                                   */
/* -------------------------------------------------------------------------- */

export async function saveSettingsAction(formData: FormData) {
  const intakeId = String(formData.get("intake_id") ?? "");
  if (!intakeId) return;

  const title = String(formData.get("title") ?? "").trim();
  const intro = String(formData.get("intro_text") ?? "").trim();
  const accountManager = String(formData.get("account_manager_name") ?? "").trim();

  await updateIntakeSettings(intakeId, {
    title: title || null,
    intro_text: intro || null,
    account_manager_name: accountManager || null,
  });

  const serviceIds = formData.getAll("service_ids").map(String).filter(Boolean);
  if (formData.has("services_present")) {
    await setIntakeServices(intakeId, serviceIds);
  }

  refresh(intakeId);
  redirect(`${ADMIN}/${intakeId}/settings?saved=1`);
}

export async function setArchivedAction(formData: FormData) {
  const intakeId = String(formData.get("intake_id") ?? "");
  const archived = formData.get("archived") === "1";
  if (!intakeId) return;

  await setArchived(intakeId, archived);
  refresh(intakeId);

  // Archiving removes it from the list, so there is nothing to go back to.
  redirect(archived ? ADMIN : `${ADMIN}/${intakeId}/settings`);
}

/* -------------------------------------------------------------------------- */
/* Client contacts                                                            */
/* -------------------------------------------------------------------------- */

export async function addContactAction(formData: FormData) {
  const intakeId = String(formData.get("intake_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  if (!intakeId || !name || !email) {
    redirect(`${ADMIN}/${intakeId}/client-access?error=contact`);
  }

  await addContact({
    intakeId,
    name,
    email,
    isPrimary: formData.get("is_primary") === "on",
  });

  refresh(intakeId);
  redirect(`${ADMIN}/${intakeId}/client-access`);
}

export async function removeContactAction(formData: FormData) {
  const intakeId = String(formData.get("intake_id") ?? "");
  const contactId = String(formData.get("contact_id") ?? "");
  if (!intakeId || !contactId) return;

  await removeContact(intakeId, contactId);
  refresh(intakeId);
  redirect(`${ADMIN}/${intakeId}/client-access`);
}
