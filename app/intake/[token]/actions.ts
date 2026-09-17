"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { saveClientAnswers, submitIntake } from "@/lib/intake/public-queries";
import type { AnswerValue } from "@/lib/intake/types";

/**
 * The only two things an unauthenticated visitor can do.
 *
 * Both take the token from the form rather than an intake id, so a client can
 * only ever address the intake they were sent. What they may write to is
 * decided server-side against that intake's own questions.
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

export async function saveProgressAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  await saveClientAnswers(token, collectAnswers(formData));
  revalidatePath(`/intake/${token}`);
  redirect(`/intake/${token}?saved=1`);
}

export async function submitAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  await submitIntake(token, collectAnswers(formData));
  revalidatePath(`/intake/${token}`);
  redirect(`/intake/${token}`);
}
