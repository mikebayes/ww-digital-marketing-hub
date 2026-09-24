import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { acceptClientAnswers, isOpenForClient, isVisibleToClient, toPublicIntake } from "./public";
import { questionnaireTitle } from "./admin";
import { isPlausibleToken } from "./token";
import type { AnswerValue, IntakeQuestion, PublicIntake } from "./types";

/**
 * Everything the public questionnaire is allowed to do.
 *
 * This is the only module that runs as the service role on behalf of someone
 * who is not signed in, so it is written defensively:
 *
 *   - the token is shape-checked before it reaches the database
 *   - the question select names its columns, and internal_notes is not among
 *     them, so the internal note never leaves Postgres on this path
 *   - what comes back still goes through the projection in public.ts before
 *     it reaches a component
 *   - writes are restricted to the questions the client could actually see
 *
 * Nothing here takes an intake id. The token is the only handle a client has,
 * which means a client cannot address an intake that was not sent to them.
 */

/**
 * Columns safe to read on the public path.
 *
 * internal_notes and final_answer are absent deliberately. final_answer is the
 * team's internal resolution of a question and may contain notes the client
 * should not read back.
 */
const PUBLIC_QUESTION_COLUMNS = [
  "id",
  "intake_id",
  "question_definition_id",
  "service_id",
  "section",
  "question_key",
  "question_text",
  "help_text",
  "field_type",
  "options",
  "client_step",
  "client_step_order",
  // Written by us and meant for the client to read. Not internal.
  "step_intro",
  "sort_order",
  "included",
  "required_mode",
  "client_visible",
  "client_editable",
  "prefill_answer",
  "client_answer",
].join(", ");

interface TokenLookup {
  intakeId: string;
  clientName: string;
  title: string;
  introText: string | null;
  status: PublicIntake["status"];
  submittedAt: string | null;
  questions: IntakeQuestion[];
}

async function lookup(token: string): Promise<TokenLookup | null> {
  if (!isPlausibleToken(token)) return null;

  /*
   * A deployment without credentials cannot answer the question "is this token
   * real", so it answers "no". The route then 404s like any bad token rather
   * than returning a 500 that advertises a half-configured application.
   */
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return null;
  }

  const supabase = createAdminClient();

  const { data: intake, error } = await supabase
    .from("intakes")
    .select("id, status, submitted_at, intro_text, title, client:clients (name), intake_services (service:services (name, slug))")
    .eq("public_token", token)
    .maybeSingle();

  if (error || !intake) return null;

  const row = intake as unknown as {
    id: string;
    status: PublicIntake["status"];
    submitted_at: string | null;
    intro_text: string | null;
    title: string | null;
    client: { name: string } | null;
    intake_services: { service: { name: string; slug: string } | null }[];
  };

  // An intake that has not been sent has no live link, even with a valid token.
  if (!isVisibleToClient(row.status)) return null;

  const { data: questions, error: questionError } = await supabase
    .from("intake_questions")
    .select(PUBLIC_QUESTION_COLUMNS)
    .eq("intake_id", row.id)
    .eq("included", true)
    .eq("client_visible", true)
    .order("client_step_order")
    .order("sort_order");

  if (questionError) return null;

  return {
    intakeId: row.id,
    clientName: row.client?.name ?? "",
    introText: row.intro_text,
    /*
     * Resolved here rather than in the page: the client tab should say what
     * they were sent, and the fallback needs the service names, which only
     * this query has. Service names are not internal — the client bought them.
     */
    title: questionnaireTitle(
      { title: row.title },
      (row.intake_services ?? [])
        .map((link) => link.service)
        .filter((service): service is { name: string; slug: string } => Boolean(service)),
    ),
    status: row.status,
    submittedAt: row.submitted_at,
    questions: (questions ?? []) as unknown as IntakeQuestion[],
  };
}

/** The questionnaire as the client should see it, or null for a bad token. */
export async function getPublicIntake(token: string): Promise<PublicIntake | null> {
  const found = await lookup(token);
  if (!found) return null;

  return toPublicIntake({
    clientName: found.clientName,
    status: found.status,
    submittedAt: found.submittedAt,
    introText: found.introText,
    title: found.title,
    questions: found.questions,
  });
}

/**
 * Save answers. Called both by "save progress" and on the way to submitting.
 *
 * Answers arrive keyed by question id and are matched against what this intake
 * actually exposed; anything unrecognised is dropped rather than written.
 */
export async function saveClientAnswers(
  token: string,
  answers: Record<string, AnswerValue>,
): Promise<{ ok: boolean }> {
  const found = await lookup(token);
  if (!found || !isOpenForClient(found.status)) return { ok: false };

  const accepted = acceptClientAnswers(found.questions, answers);
  if (accepted.length === 0) return { ok: true };

  const supabase = createAdminClient();

  for (const { id, client_answer } of accepted) {
    const { error } = await supabase
      .from("intake_questions")
      .update({ client_answer })
      .eq("id", id)
      .eq("intake_id", found.intakeId);
    if (error) return { ok: false };
  }

  // First contact moves the intake off "sent" so the team can see it is live.
  if (found.status === "sent") {
    await supabase
      .from("intakes")
      .update({ status: "in_progress" })
      .eq("id", found.intakeId);
  }

  return { ok: true };
}

/**
 * Submit.
 *
 * Deliberately has no completeness check. required_by_completion is a debt
 * Web Wizards owes, not a gate the client has to clear, and the intro tells
 * them to leave anything they are unsure about blank.
 */
export async function submitIntake(
  token: string,
  answers: Record<string, AnswerValue>,
): Promise<{ ok: boolean }> {
  const saved = await saveClientAnswers(token, answers);
  if (!saved.ok) return { ok: false };

  const found = await lookup(token);
  if (!found || !isOpenForClient(found.status)) return { ok: false };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("intakes")
    .update({ status: "submitted", submitted_at: new Date().toISOString() })
    .eq("id", found.intakeId);

  return { ok: !error };
}
