import type {
  AnswerValue,
  IntakeQuestion,
  IntakeStatus,
  PublicIntake,
  PublicQuestion,
  PublicStep,
} from "./types";

/**
 * The boundary between internal and client-facing data.
 *
 * Everything the public questionnaire renders passes through here. It is a
 * pure function with no database access so it can be tested exhaustively, and
 * it builds its output field by field rather than by deleting keys from an
 * internal object — an internal field added to IntakeQuestion later cannot
 * reach a client by being forgotten about here.
 *
 * Three independent things keep internal content in: the question is dropped
 * unless included and client_visible, internal_notes and final_answer are
 * never read, and the caller selects a narrow column list from Postgres in the
 * first place. Any one of them failing is not enough to leak.
 */

/** Questions the client is allowed to see, in the order they should appear. */
export function visibleQuestions(questions: IntakeQuestion[]): IntakeQuestion[] {
  return questions
    .filter((q) => q.included && q.client_visible)
    .sort(
      (a, b) =>
        a.client_step_order - b.client_step_order || a.sort_order - b.sort_order,
    );
}

/**
 * What the client should see in the field: their own answer once they have
 * given one, otherwise whatever the Account Manager pre-filled.
 *
 * A client answer of "" is a real answer — the client cleared the field — so
 * only null and undefined fall through to the pre-fill.
 */
export function resolveClientValue(question: IntakeQuestion): AnswerValue {
  return question.client_answer ?? question.prefill_answer ?? null;
}

function toPublicQuestion(question: IntakeQuestion): PublicQuestion {
  return {
    id: question.id,
    question_key: question.question_key,
    question_text: question.question_text,
    help_text: question.help_text,
    field_type: question.field_type,
    options: question.options ?? [],
    required_mode: question.required_mode,
    // A pre-filled answer the client may not change is shown read-only rather
    // than hidden, so they can still see what we believe.
    editable: question.client_editable,
    value: resolveClientValue(question),
  };
}

/**
 * Group visible questions into the steps the client moves through.
 *
 * Steps come from the data, not from a hard-coded list, so adding SEO or Paid
 * Media later is a seed-data change rather than a form change. A question with
 * no client_step is placed in a trailing unnamed step rather than dropped.
 */
export function buildSteps(questions: IntakeQuestion[]): PublicStep[] {
  const ordered = visibleQuestions(questions);
  const steps: PublicStep[] = [];
  const index = new Map<string, PublicStep>();

  for (const question of ordered) {
    const title = question.client_step?.trim() || "Anything Else";
    let step = index.get(title);
    if (!step) {
      step = { title, questions: [] };
      index.set(title, step);
      steps.push(step);
    }
    step.questions.push(toPublicQuestion(question));
  }

  return steps;
}

export function toPublicIntake(input: {
  clientName: string;
  status: IntakeStatus;
  submittedAt: string | null;
  introText?: string | null;
  questions: IntakeQuestion[];
}): PublicIntake {
  return {
    clientName: input.clientName,
    status: input.status,
    submittedAt: input.submittedAt,
    introText: input.introText ?? null,
    steps: buildSteps(input.questions),
  };
}

/**
 * Statuses at which the questionnaire still accepts input.
 *
 * Once an intake is submitted the client sees the confirmation screen instead;
 * reopening it is an internal decision, not something a stale tab can do.
 */
export function isOpenForClient(status: IntakeStatus): boolean {
  return status === "sent" || status === "in_progress";
}

/**
 * Whether a token holder should see anything at all.
 *
 * A draft or ready intake has not been sent yet, so its link is not live even
 * if the token is correct.
 */
export function isVisibleToClient(status: IntakeStatus): boolean {
  return (
    isOpenForClient(status) ||
    status === "submitted" ||
    status === "reviewed" ||
    status === "complete"
  );
}

/**
 * Restrict an incoming answer set to questions the client was actually allowed
 * to answer. Anything else in the payload is discarded rather than trusted —
 * the form is not the only thing that can post to the endpoint.
 */
export function acceptClientAnswers(
  questions: IntakeQuestion[],
  submitted: Record<string, AnswerValue>,
): { id: string; client_answer: AnswerValue }[] {
  const writable = new Map(
    visibleQuestions(questions)
      .filter((q) => q.client_editable)
      .map((q) => [q.id, q]),
  );

  const accepted: { id: string; client_answer: AnswerValue }[] = [];
  for (const [id, value] of Object.entries(submitted)) {
    const question = writable.get(id);
    if (!question) continue;
    accepted.push({ id, client_answer: normalizeAnswer(question, value) });
  }
  return accepted;
}

/** Coerce a posted value into the shape the question's field type expects. */
export function normalizeAnswer(
  question: Pick<IntakeQuestion, "field_type" | "options">,
  value: AnswerValue,
): AnswerValue {
  if (value === null || value === undefined) return null;

  if (question.field_type === "multiselect") {
    const list = Array.isArray(value) ? value : [value];
    const allowed = new Set(question.options ?? []);
    const cleaned = list
      .filter((v): v is string => typeof v === "string")
      .filter((v) => allowed.size === 0 || allowed.has(v));
    return cleaned.length > 0 ? cleaned : null;
  }

  if (question.field_type === "boolean") {
    if (typeof value === "boolean") return value;
    if (value === "true") return true;
    if (value === "false") return false;
    return null;
  }

  if (question.field_type === "select") {
    if (typeof value !== "string") return null;
    const allowed = question.options ?? [];
    if (allowed.length > 0 && !allowed.includes(value)) return null;
    return value === "" ? null : value;
  }

  if (Array.isArray(value)) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
