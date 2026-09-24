/**
 * Shared types for the Client Intakes module.
 *
 * These mirror supabase/migrations/0001_intakes.sql. They are written by hand
 * rather than generated so the module has no build-time dependency on a live
 * Supabase project; if the schema changes, change both.
 */

export type IntakeStatus =
  | "draft"
  | "ready"
  | "sent"
  | "in_progress"
  | "submitted"
  | "reviewed"
  | "complete";

export type RequiredMode = "required" | "optional" | "required_by_completion";

export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "url"
  | "select"
  | "multiselect"
  | "boolean";

/** An answer value. Multiselect stores an array; everything else a scalar. */
export type AnswerValue = string | string[] | boolean | null;

export interface Client {
  id: string;
  name: string;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  sort_order: number;
}

/**
 * A question as it exists inside one intake. This is a snapshot taken when the
 * intake was created — editing the master library afterwards does not reach it.
 */
export interface IntakeQuestion {
  id: string;
  intake_id: string;
  question_definition_id: string | null;
  service_id: string;
  section: string;
  question_key: string;
  question_text: string;
  help_text: string | null;
  field_type: FieldType;
  options: string[];
  client_step: string | null;
  client_step_order: number;
  /** Shown once above this question's step. Null on all but the first. */
  step_intro: string | null;
  sort_order: number;
  included: boolean;
  required_mode: RequiredMode;
  client_visible: boolean;
  client_editable: boolean;
  prefill_answer: AnswerValue;
  client_answer: AnswerValue;
  final_answer: AnswerValue;
  internal_notes: string | null;
}

export interface Intake {
  id: string;
  client_id: string;
  account_manager_name: string | null;
  /** Explicit name. Null derives one from the client and services. */
  title: string | null;
  /** The paragraph above the first question. Null uses the standard wording. */
  intro_text: string | null;
  /** Set to hide from the admin list. Never deleted. */
  archived_at: string | null;
  status: IntakeStatus;
  public_token: string;
  sent_at: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * An approved client contact.
 *
 * Record-keeping only today: the public questionnaire still authenticates with
 * the token alone. The approved-email gate is separate work.
 */
export interface IntakeContact {
  id: string;
  intake_id: string;
  name: string;
  email: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

/** An intake joined with the things every screen needs alongside it. */
export interface IntakeWithRelations extends Intake {
  client: Pick<Client, "id" | "name" | "website">;
  services: Pick<Service, "id" | "name" | "slug">[];
}

/* -------------------------------------------------------------------------- */
/* Public shapes                                                              */
/* -------------------------------------------------------------------------- */

/**
 * A question as the client sees it.
 *
 * Deliberately a different type from IntakeQuestion rather than a Partial of
 * it: internal_notes and final_answer are not optional fields here, they do
 * not exist. A mistake in the projection is then a type error rather than a
 * silent leak.
 */
export interface PublicQuestion {
  id: string;
  question_key: string;
  question_text: string;
  help_text: string | null;
  field_type: FieldType;
  options: string[];
  required_mode: RequiredMode;
  editable: boolean;
  /** Pre-fill and client answer resolved into the value to show in the field. */
  value: AnswerValue;
}

export interface PublicStep {
  title: string;
  /** The step's own opening paragraphs, when it has any. */
  intro: string | null;
  questions: PublicQuestion[];
}

export interface PublicIntake {
  clientName: string;
  /** What this questionnaire is called, resolved. Used for the browser tab. */
  title: string;
  /**
   * The paragraph above the first question, when this intake sets one.
   * Authored by Web Wizards for this client; null uses the standard wording.
   */
  introText: string | null;
  status: IntakeStatus;
  submittedAt: string | null;
  steps: PublicStep[];
}
