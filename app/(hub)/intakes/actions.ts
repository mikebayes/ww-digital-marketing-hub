"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createClientRecord,
  createIntake,
  getIntake,
  getIntakeQuestions,
  updateIntake,
  updateIntakeQuestion,
} from "@/lib/intake/queries";
import { normalizeAnswer } from "@/lib/intake/public";
import { canTransition, timestampsFor } from "@/lib/intake/status";
import type { AnswerValue, IntakeStatus } from "@/lib/intake/types";

/**
 * Internal mutations. Every one of these runs behind the proxy's session gate
 * and as the signed-in staff member, so RLS applies on top.
 */

export async function createIntakeAction(formData: FormData) {
  const existingClientId = String(formData.get("client_id") ?? "").trim();
  const newClientName = String(formData.get("new_client_name") ?? "").trim();
  const newClientWebsite = String(formData.get("new_client_website") ?? "").trim();
  const accountManager = String(formData.get("account_manager_name") ?? "").trim();
  const serviceIds = formData.getAll("service_ids").map(String).filter(Boolean);

  let clientId = existingClientId;
  if (!clientId) {
    if (!newClientName) redirect("/intakes/new?error=client");
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

  revalidatePath("/intakes");
  redirect(`/intakes/${intake.id}/edit`);
}

/**
 * Save the Account Manager's pass over the questionnaire.
 *
 * Inclusion and pre-fill arrive together because they are edited together; a
 * question the AM excluded should not also silently keep a pre-fill that would
 * reappear if they re-included it, so both are written every time.
 */
export async function saveIntakeQuestionsAction(formData: FormData) {
  const intakeId = String(formData.get("intake_id") ?? "");
  if (!intakeId) return;

  const questions = await getIntakeQuestions(intakeId);

  for (const question of questions) {
    const included = formData.get(`included:${question.id}`) === "on";
    const raw = formData.getAll(`prefill:${question.id}`).map(String);

    let value: AnswerValue = null;
    if (question.field_type === "multiselect") {
      value = raw.length > 0 ? raw : null;
    } else {
      value = raw[0] ?? null;
    }

    const notes = formData.get(`notes:${question.id}`);

    await updateIntakeQuestion(question.id, {
      included,
      prefill_answer: normalizeAnswer(question, value),
      internal_notes: notes === null ? question.internal_notes : String(notes).trim() || null,
    });
  }

  revalidatePath(`/intakes/${intakeId}`);
  revalidatePath(`/intakes/${intakeId}/edit`);
  redirect(`/intakes/${intakeId}`);
}

/** Finalise answers after the client has submitted. */
export async function saveFinalAnswersAction(formData: FormData) {
  const intakeId = String(formData.get("intake_id") ?? "");
  if (!intakeId) return;

  const questions = await getIntakeQuestions(intakeId);

  for (const question of questions) {
    const raw = formData.getAll(`final:${question.id}`).map(String);
    const hasField = formData.has(`final:${question.id}`);
    if (!hasField) continue;

    const value: AnswerValue =
      question.field_type === "multiselect" ? (raw.length > 0 ? raw : null) : raw[0] ?? null;

    const notes = formData.get(`notes:${question.id}`);

    await updateIntakeQuestion(question.id, {
      final_answer: normalizeAnswer(question, value),
      internal_notes: notes === null ? question.internal_notes : String(notes).trim() || null,
    });
  }

  revalidatePath(`/intakes/${intakeId}`);
  redirect(`/intakes/${intakeId}`);
}

/**
 * Move an intake through its lifecycle.
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
    redirect(`/intakes/${intakeId}?error=transition`);
  }

  await updateIntake(intakeId, { status: to, ...timestampsFor(to) });

  revalidatePath("/intakes");
  revalidatePath(`/intakes/${intakeId}`);
  redirect(`/intakes/${intakeId}`);
}
