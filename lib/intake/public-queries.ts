import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { acceptClientAnswers, isOpenForClient, isVisibleToClient, toPublicIntake } from "./public";
import { questionnaireTitle } from "./admin";
import { emailMatches } from "./client-session";
import { isPlausibleToken } from "./token";
import type {
  AnswerValue,
  IntakeContact,
  IntakeQuestion,
  PublicIntake,
} from "./types";

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
  /*
   * Attribution. The contact id is read to look up a name and is never
   * emitted — toPublicQuestion builds an AnswerAttribution with the name
   * only, so no internal id reaches the page.
   */
  "answered_by_contact_id",
  "answered_at",
  "answer_revision_count",
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

  /*
   * Contact names, for the attribution line under each answer. Names only —
   * the client's colleagues know who each other are, and nothing else about a
   * contact reaches the page.
   */
  const supabase = createAdminClient();
  const { data: contacts } = await supabase
    .from("intake_contacts")
    .select("id, name")
    .eq("intake_id", found.intakeId);

  const contactNames = new Map(
    ((contacts ?? []) as { id: string; name: string }[]).map((contact) => [
      contact.id,
      contact.name,
    ]),
  );

  return toPublicIntake({
    contactNames,
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
/* -------------------------------------------------------------------------- */
/* Who is answering                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Check a typed email against the contacts approved for this questionnaire.
 *
 * Server-side and by token: a browser cannot ask about a questionnaire it was
 * not sent. Returns the contact or null, and the caller says the same thing
 * either way — telling a stranger that an address is approved would hand them
 * half the credential.
 */
export async function findApprovedContact(
  token: string,
  email: string,
): Promise<{ intakeId: string; contact: IntakeContact } | null> {
  const found = await lookup(token);
  if (!found) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("intake_contacts")
    .select(CONTACT_COLUMNS)
    .eq("intake_id", found.intakeId);
  if (error || !data) return null;

  const contact = (data as IntakeContact[]).find((candidate) =>
    emailMatches(email, candidate.email),
  );
  return contact ? { intakeId: found.intakeId, contact } : null;
}

/**
 * Re-check a session claim against the database.
 *
 * A valid signature proves the cookie was minted here; it does not prove the
 * contact is still approved. Removing someone in the admin has to lock them
 * out of a browser that already holds a cookie, so the row is looked up every
 * time rather than trusted from the cookie.
 */
export async function resolveSessionContact(
  token: string,
  session: { intakeId: string; contactId: string } | null,
): Promise<{ intakeId: string; contact: IntakeContact } | null> {
  if (!session) return null;

  const found = await lookup(token);
  if (!found || found.intakeId !== session.intakeId) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("intake_contacts")
    .select(CONTACT_COLUMNS)
    .eq("id", session.contactId)
    .eq("intake_id", found.intakeId)
    .maybeSingle();

  if (error || !data) return null;
  return { intakeId: found.intakeId, contact: data as IntakeContact };
}

const CONTACT_COLUMNS =
  "id, intake_id, name, email, is_primary, participation, first_accessed_at, last_activity_at, submitted_at, created_at, updated_at";

/** Note that a contact has opened the questionnaire. */
export async function markContactActive(
  contactId: string,
  { started = false }: { started?: boolean } = {},
): Promise<void> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  await supabase
    .from("intake_contacts")
    .update({ last_activity_at: now })
    .eq("id", contactId);

  if (started) {
    /*
     * First access only. Guarded on the column being null rather than written
     * every time, or "first accessed" would quietly mean "last accessed" and
     * the two timestamps would always agree.
     */
    await supabase
      .from("intake_contacts")
      .update({ first_accessed_at: now })
      .eq("id", contactId)
      .is("first_accessed_at", null);
  }

  /*
   * Getting through the email gate is enough to be in progress. The admin
   * shows status beside last activity, and "Not started" next to a timestamp
   * from four minutes ago is a contradiction somebody has to stop and resolve.
   *
   * Guarded on the current value so a contact who has already submitted is not
   * dragged back to in progress by returning to look at their answers.
   */
  await supabase
    .from("intake_contacts")
    .update({ participation: "in_progress" })
    .eq("id", contactId)
    .eq("participation", "not_started");
}

/**
 * One contact has sent their answers.
 *
 * About that person and nobody else: the questionnaire stays live, the other
 * contacts are untouched, and this one can come back and change things while
 * it remains open. Only Web Wizards ends a questionnaire.
 */
export async function markContactSubmitted(contactId: string): Promise<void> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  await supabase
    .from("intake_contacts")
    .update({
      participation: "submitted",
      submitted_at: now,
      last_activity_at: now,
    })
    .eq("id", contactId);
}

/* -------------------------------------------------------------------------- */
/* Writing answers                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Save what a contact has typed.
 *
 * Every write is validated three times over: the token resolves the intake,
 * acceptClientAnswers drops anything that was not actually exposed as
 * editable, and record_client_answer re-checks in Postgres that the question
 * belongs to this intake, is included and is client-visible. A forged question
 * id would have to survive all three.
 *
 * The answer and its history move together inside that function, so there is
 * no window where the current answer has changed but the record of the change
 * has not.
 */
export async function saveClientAnswers(
  token: string,
  answers: Record<string, AnswerValue>,
  contactId: string,
): Promise<{ ok: boolean; changed: number }> {
  const found = await lookup(token);
  if (!found || !isOpenForClient(found.status)) return { ok: false, changed: 0 };

  const accepted = acceptClientAnswers(found.questions, answers);
  const supabase = createAdminClient();
  let changed = 0;

  for (const { id, client_answer } of accepted) {
    const { data, error } = await supabase.rpc("record_client_answer", {
      p_intake_id: found.intakeId,
      p_question_id: id,
      p_contact_id: contactId,
      p_answer: client_answer,
    });
    if (error) return { ok: false, changed };
    if (data === true) changed += 1;
  }

  await markContactActive(contactId);

  /*
   * The first answer moves the questionnaire off "sent" so the team can see
   * somebody is working on it. It does not close anything — only Web Wizards
   * ends a questionnaire.
   */
  if (found.status === "sent") {
    await supabase
      .from("intakes")
      .update({ status: "in_progress" })
      .eq("id", found.intakeId);
  }

  return { ok: true, changed };
}
