import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { generatePublicToken } from "./token";
import type {
  Client,
  Intake,
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
 * So these run as the service role for now. Be clear about what that costs:
 * RLS is no longer enforcing anything for the internal admin, and with no
 * gate in front of it either, **anyone who knows the Hub's URL can read and
 * write client intake records**. That is the accepted state while the Hub is
 * unauthenticated, not a property to design anything else around.
 *
 * What it does not cost: the anon key still grants nothing on any table, so a
 * leaked anon key reads nothing through PostgREST, and the client
 * questionnaire's projection boundary in lib/intake/public.ts is untouched.
 *
 * TO RESTORE: put back `import { createClient } from "@/lib/supabase/server";`
 * and delete createClient() below. No call site changes — the local name is
 * the same for exactly that reason.
 * ==========================================================================
 */

async function createClient() {
  return createAdminClient();
}

const INTAKE_COLUMNS =
  "id, client_id, account_manager_name, status, public_token, sent_at, submitted_at, reviewed_at, completed_at, created_at, updated_at";

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

/** The list screen: one row per intake with the things worth scanning. */
export async function listIntakes(): Promise<IntakeWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("intakes")
    .select(
      `${INTAKE_COLUMNS}, client:clients (id, name, website), intake_services (service:services (id, name, slug))`,
    )
    .order("updated_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map(flattenIntake);
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

  const { data: definitions, error: defError } = await supabase
    .from("question_definitions")
    .select("*")
    .in("service_id", serviceIds)
    .eq("active", true)
    .order("sort_order");
  if (defError) throw defError;

  if (definitions && definitions.length > 0) {
    const { error: snapshotError } = await supabase
      .from("intake_questions")
      .insert(
        definitions.map((d) => ({
          intake_id: intake.id,
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
          sort_order: d.sort_order,
          included: d.default_enabled,
          required_mode: d.required_mode,
          client_visible: d.client_visible,
          client_editable: d.client_editable,
        })),
      );
    if (snapshotError) throw snapshotError;
  }

  return intake;
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
