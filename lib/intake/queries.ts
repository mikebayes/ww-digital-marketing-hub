import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ACCESS_COOKIE,
  UNLOCK_PATH,
  isValidToken,
} from "@/lib/auth/temporary-gate";
import { generatePublicToken } from "./token";
import type {
  AnswerValue,
  Client,
  Intake,
  IntakeContact,
  IntakeQuestion,
  IntakeWithRelations,
  Service,
} from "./types";

/**
 * Internal reads and writes for the staff intake admin.
 *
 * TEMPORARY (2026-09-24) — how these reach the database.
 * ==========================================================================
 * These ran through createClient() in lib/supabase/server.ts: the anon key
 * plus the staff member's Supabase session, so every query executed as the
 * `authenticated` role with RLS applied on top.
 *
 * Microsoft sign-in is disabled (see lib/auth/microsoft-gate.ts), so there is
 * no session, and that client resolves to the `anon` role — which the
 * migration grants nothing. Every screen under /intakes returned 42501.
 *
 * So these run as the service role, and because RLS is no longer underneath
 * them, the shared key in lib/auth/temporary-gate.ts is what stands in front.
 * The key is checked here as well as in proxy.ts, and that is not belt and
 * braces: a Next.js Server Action can be dispatched at any route in the
 * application, including the documentation pages the proxy deliberately does
 * not match, so a check that lived only in the proxy would leave the
 * mutations in app/(hub)/intakes/actions.ts reachable without it. Putting it
 * where the data is covers every caller regardless of how it arrived.
 *
 * What this does not cost: the anon key still grants nothing on any table, so
 * a leaked anon key reads nothing through PostgREST, and the client
 * questionnaire's projection boundary in lib/intake/public.ts is untouched.
 *
 * TO RESTORE: put back `import { createClient } from "@/lib/supabase/server";`
 * and delete createClient() below. No call site changes — the local name is
 * the same for exactly that reason.
 * ==========================================================================
 */

async function createClient() {
  const store = await cookies();
  if (!(await isValidToken(store.get(ACCESS_COOKIE)?.value))) {
    redirect(`${UNLOCK_PATH}?next=%2Fclient-questionnaires%2Fadmin`);
  }
  return createAdminClient();
}

const INTAKE_COLUMNS =
  "id, client_id, account_manager_name, title, intro_text, archived_at, status, public_token, sent_at, submitted_at, reviewed_at, completed_at, created_at, updated_at";

export async function listServices(): Promise<Service[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("id, name, slug, active, sort_order")
    .eq("active", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function listClients(): Promise<Client[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("id, name, website, created_at, updated_at")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function createClientRecord(input: {
  name: string;
  website?: string | null;
}): Promise<Client> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({ name: input.name, website: input.website || null })
    .select("id, name, website, created_at, updated_at")
    .single();
  if (error) throw error;
  return data;
}

/**
 * The list screen: one row per questionnaire with the things worth scanning.
 *
 * Archived rows are left out unless asked for. Archiving is how a
 * questionnaire leaves the list without leaving the record, so the default has
 * to be the list people actually work from.
 */
export async function listIntakes(
  { includeArchived = false }: { includeArchived?: boolean } = {},
): Promise<IntakeWithRelations[]> {
  const supabase = await createClient();
  let query = supabase
    .from("intakes")
    .select(
      `${INTAKE_COLUMNS}, client:clients (id, name, website), intake_services (service:services (id, name, slug))`,
    );

  if (!includeArchived) query = query.is("archived_at", null);

  const { data, error } = await query.order("updated_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map(flattenIntake);
}

/** How many are hidden, so the list can say so rather than just omit them. */
export async function countArchivedIntakes(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("intakes")
    .select("id", { count: "exact", head: true })
    .not("archived_at", "is", null);
  if (error) throw error;
  return count ?? 0;
}

export async function getIntake(id: string): Promise<IntakeWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("intakes")
    .select(
      `${INTAKE_COLUMNS}, client:clients (id, name, website), intake_services (service:services (id, name, slug))`,
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? flattenIntake(data) : null;
}

export async function getIntakeQuestions(
  intakeId: string,
): Promise<IntakeQuestion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("intake_questions")
    .select("*")
    .eq("intake_id", intakeId)
    .order("client_step_order")
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as IntakeQuestion[];
}

/**
 * Create an intake and snapshot its questions.
 *
 * The snapshot is the point of the whole table: an intake keeps the wording it
 * was created with, so editing the master library next quarter cannot change
 * what a client was asked last quarter, or what they were answering when they
 * agreed to something.
 *
 * Common is always included, whether or not it was passed in.
 */
export async function createIntake(input: {
  clientId: string;
  serviceIds: string[];
  accountManagerName: string | null;
}): Promise<Intake> {
  const supabase = await createClient();

  const { data: commonService, error: commonError } = await supabase
    .from("services")
    .select("id")
    .eq("slug", "common")
    .single();
  if (commonError) throw commonError;

  const serviceIds = Array.from(
    new Set([commonService.id, ...input.serviceIds]),
  );

  const { data: intake, error: intakeError } = await supabase
    .from("intakes")
    .insert({
      client_id: input.clientId,
      account_manager_name: input.accountManagerName,
      status: "draft",
      public_token: generatePublicToken(),
    })
    .select(INTAKE_COLUMNS)
    .single();
  if (intakeError) throw intakeError;

  const { error: linkError } = await supabase.from("intake_services").insert(
    serviceIds.map((serviceId) => ({
      intake_id: intake.id,
      service_id: serviceId,
    })),
  );
  if (linkError) throw linkError;

  await snapshotQuestions(supabase, intake.id, serviceIds);

  return intake;
}

/**
 * Copy the active question library for these services onto an intake.
 *
 * Shared by creation and by adding a service afterwards, so a service added
 * later brings exactly the questions it would have brought on day one. Only
 * the services passed in are snapshotted — questions already on the intake are
 * never re-copied, because a second copy would duplicate wording the client
 * may already have answered.
 */
async function snapshotQuestions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  intakeId: string,
  serviceIds: string[],
): Promise<void> {
  if (serviceIds.length === 0) return;

  const { data: definitions, error: defError } = await supabase
    .from("question_definitions")
    .select("*")
    .in("service_id", serviceIds)
    .eq("active", true)
    .order("sort_order");
  if (defError) throw defError;
  if (!definitions || definitions.length === 0) return;

  const { error: snapshotError } = await supabase
    .from("intake_questions")
    .insert(
      definitions.map((d) => ({
        intake_id: intakeId,
        question_definition_id: d.id,
        service_id: d.service_id,
        section: d.section,
        question_key: d.question_key,
        question_text: d.question_text,
        help_text: d.help_text,
        field_type: d.field_type,
        options: d.options,
        client_step: d.client_step,
        client_step_order: d.client_step_order,
        step_intro: d.step_intro,
        sort_order: d.sort_order,
        included: d.default_enabled,
        required_mode: d.required_mode,
        client_visible: d.client_visible,
        client_editable: d.client_editable,
      })),
    );
  if (snapshotError) throw snapshotError;
}

/** Account Manager edits to a snapshotted question. */
export async function updateIntakeQuestion(
  questionId: string,
  patch: Partial<
    Pick<
      IntakeQuestion,
      | "included"
      | "required_mode"
      | "client_visible"
      | "client_editable"
      | "prefill_answer"
      | "final_answer"
      | "internal_notes"
    >
  >,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("intake_questions")
    .update(patch)
    .eq("id", questionId);
  if (error) throw error;
}

export async function updateIntake(
  id: string,
  patch: Record<string, unknown>,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("intakes").update(patch).eq("id", id);
  if (error) throw error;
}

/* -------------------------------------------------------------------------- */

type IntakeRow = Intake & {
  client: Pick<Client, "id" | "name" | "website">;
  intake_services: { service: Pick<Service, "id" | "name" | "slug"> }[];
};

/** Supabase nests joined rows; the screens want a flat services array. */
function flattenIntake(row: unknown): IntakeWithRelations {
  const intake = row as IntakeRow;
  return {
    ...intake,
    client: intake.client,
    services: (intake.intake_services ?? [])
      .map((link) => link.service)
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

/* -------------------------------------------------------------------------- */
/* Client contacts                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Who at the client this questionnaire is for.
 *
 * Record-keeping only: the public route still authenticates with the token
 * alone, so adding or removing a contact changes who we chase, not who can
 * open the link. The approved-email gate is separate work, and conflating the
 * two here would be a security change nobody asked for.
 */
export async function listContacts(intakeId: string): Promise<IntakeContact[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("intake_contacts")
    .select(
      "id, intake_id, name, email, is_primary, participation, first_accessed_at, last_activity_at, finished_at, created_at, updated_at",
    )
    .eq("intake_id", intakeId)
    .order("is_primary", { ascending: false })
    .order("name");
  if (error) throw error;
  return (data ?? []) as IntakeContact[];
}

export async function addContact(input: {
  intakeId: string;
  name: string;
  email: string;
  isPrimary: boolean;
}): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("intake_contacts").insert({
    intake_id: input.intakeId,
    name: input.name,
    email: input.email.toLowerCase(),
    is_primary: input.isPrimary,
  });
  // A duplicate email on one questionnaire is a mis-click, not a failure worth
  // throwing a 500 over; the unique constraint has already refused the row.
  if (error && error.code !== "23505") throw error;
}

export async function removeContact(
  intakeId: string,
  contactId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("intake_contacts")
    .delete()
    .eq("id", contactId)
    .eq("intake_id", intakeId);
  if (error) throw error;
}

/* -------------------------------------------------------------------------- */
/* Settings                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Settings the Account Manager may change after an intake exists.
 *
 * Deliberately narrow. public_token is absent because a questionnaire's link
 * is its credential and editing one by hand would break a link already sent;
 * status is absent because it moves through the lifecycle in status.ts, not by
 * being typed into a form.
 */
export async function updateIntakeSettings(
  id: string,
  patch: {
    title?: string | null;
    intro_text?: string | null;
    account_manager_name?: string | null;
  },
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("intakes").update(patch).eq("id", id);
  if (error) throw error;
}

/** Archive, or put back. Never deletes: the record is the point. */
export async function setArchived(id: string, archived: boolean): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("intakes")
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw error;
}

/** Replace the services on an intake, snapshotting any newly added questions. */
export async function setIntakeServices(
  intakeId: string,
  serviceIds: string[],
): Promise<void> {
  const supabase = await createClient();

  const { data: common, error: commonError } = await supabase
    .from("services")
    .select("id")
    .eq("slug", "common")
    .single();
  if (commonError) throw commonError;

  const wanted = new Set([common.id, ...serviceIds]);

  const { data: existing, error: existingError } = await supabase
    .from("intake_services")
    .select("id, service_id")
    .eq("intake_id", intakeId);
  if (existingError) throw existingError;

  const have = new Set((existing ?? []).map((row) => row.service_id));

  /*
   * Removing a service unlinks it but leaves its snapshotted questions alone.
   * Those questions may already hold answers the client gave us, and deleting
   * them to tidy up a service list would throw that away. They are excluded
   * from the questionnaire instead, which is reversible.
   */
  const toRemove = (existing ?? []).filter((row) => !wanted.has(row.service_id));
  if (toRemove.length > 0) {
    await supabase
      .from("intake_services")
      .delete()
      .in("id", toRemove.map((row) => row.id));

    await supabase
      .from("intake_questions")
      .update({ included: false })
      .eq("intake_id", intakeId)
      .in("service_id", toRemove.map((row) => row.service_id));
  }

  const toAdd = [...wanted].filter((id) => !have.has(id));
  if (toAdd.length === 0) return;

  await supabase
    .from("intake_services")
    .insert(toAdd.map((serviceId) => ({ intake_id: intakeId, service_id: serviceId })));

  await snapshotQuestions(supabase, intakeId, toAdd);
}

/* -------------------------------------------------------------------------- */
/* Answer history                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Every recorded change to one client answer, newest first.
 *
 * Staff only, and it lives here rather than in public-queries for that reason:
 * the revision trail names which colleague changed what, and the client's own
 * page shows only the most recent attribution.
 */
export async function answerHistory(
  intakeId: string,
  questionId: string,
): Promise<
  {
    id: string;
    contactName: string | null;
    previous: AnswerValue;
    next: AnswerValue;
    at: string;
  }[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("intake_answer_revisions")
    .select("id, previous_answer, new_answer, created_at, contact:intake_contacts (name)")
    .eq("intake_id", intakeId)
    .eq("intake_question_id", questionId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as unknown as {
    id: string;
    previous_answer: AnswerValue;
    new_answer: AnswerValue;
    created_at: string;
    contact: { name: string } | null;
  }[]).map((row) => ({
    id: row.id,
    contactName: row.contact?.name ?? null,
    previous: row.previous_answer,
    next: row.new_answer,
    at: row.created_at,
  }));
}
