import { effectiveAnswer } from "./status.ts";
import type {
  Intake,
  IntakeQuestion,
  IntakeWithRelations,
  Service,
} from "./types";

/**
 * The shapes the admin screens read, worked out here rather than in JSX.
 *
 * Everything in this module is pure. The Questions tab and the Responses tab
 * both need to say whether a question is answered, outstanding or finalised,
 * and if they each decided that for themselves they would eventually disagree
 * — the count in a header saying one thing and the rows beneath it another.
 */

/* -------------------------------------------------------------------------- */
/* Naming                                                                     */
/* -------------------------------------------------------------------------- */

/** The services that describe the engagement — Common is on every intake. */
export function billableServices<T extends Pick<Service, "slug" | "name">>(
  services: T[],
): T[] {
  return services.filter((service) => service.slug !== "common");
}

export function serviceSummary(
  services: Pick<Service, "slug" | "name">[],
): string {
  const named = billableServices(services).map((service) => service.name);
  return named.length > 0 ? named.join(", ") : "Common only";
}

/**
 * What to call a questionnaire.
 *
 * An explicit title wins. Otherwise it is built from the services, because
 * "Social Media" beside the client name is what people call it in Productive
 * and in conversation.
 */
export function questionnaireTitle(
  intake: Pick<Intake, "title">,
  services: Pick<Service, "slug" | "name">[],
): string {
  const explicit = intake.title?.trim();
  if (explicit) return explicit;
  const named = billableServices(services).map((service) => service.name);
  return named.length > 0
    ? `${named.join(" & ")} Questionnaire`
    : "Client Questionnaire";
}

/** All-Weather-at-Home-Social-Media-Client-Intake.pdf */
export function documentFileName(
  clientName: string,
  services: Pick<Service, "slug" | "name">[],
): string {
  const parts = [clientName, ...billableServices(services).map((s) => s.name)];
  const slug = parts
    .join(" ")
    .replace(/[^A-Za-z0-9 ]+/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return `${slug}-Client-Intake`;
}

/* -------------------------------------------------------------------------- */
/* Grouping                                                                   */
/* -------------------------------------------------------------------------- */

export interface QuestionGroup {
  /** "Your Business", "Access", "Internal preparation". */
  title: string;
  /** False for the internal preparation group, which no client ever sees. */
  clientFacing: boolean;
  questions: IntakeQuestion[];
}

/**
 * Group questions the way both the Account Manager and the client see them.
 *
 * client_step is the grouping the client's questionnaire already uses, so the
 * admin borrows it: what the AM is looking at on this screen is the shape of
 * the thing the client will open. Internal-only questions carry no step and
 * collect under their section instead, which is how they end up in one
 * "Internal preparation" group at the top rather than scattered.
 *
 * Order comes from the data — client_step_order then sort_order — so adding a
 * service later is a seed change rather than a change here.
 */
export function groupQuestions(questions: IntakeQuestion[]): QuestionGroup[] {
  const order: string[] = [];
  const groups = new Map<string, QuestionGroup>();

  const sorted = [...questions].sort(
    (a, b) =>
      a.client_step_order - b.client_step_order || a.sort_order - b.sort_order,
  );

  for (const question of sorted) {
    const title = question.client_step?.trim() || question.section || "Other";
    let group = groups.get(title);
    if (!group) {
      group = { title, clientFacing: Boolean(question.client_step), questions: [] };
      groups.set(title, group);
      order.push(title);
    }
    /*
     * A group is client-facing if anything in it is. Mixed groups do not occur
     * in the current library, but assuming they cannot is how a future one
     * ends up labelled internal and quietly withheld.
     */
    if (question.client_step) group.clientFacing = true;
    group.questions.push(question);
  }

  return order.map((title) => groups.get(title)!);
}

/* -------------------------------------------------------------------------- */
/* State                                                                      */
/* -------------------------------------------------------------------------- */

export function isBlank(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export type ResponseState =
  /** The client answered and nobody has needed to change it. */
  | "answered"
  /** We wrote the answer we are going with. */
  | "finalized"
  /** Asked, included, and still nothing to show for it. */
  | "outstanding"
  /** Internal preparation, or a client-visible question we pre-filled. */
  | "prepared"
  /** Not asked. */
  | "excluded";

export const RESPONSE_STATE_LABELS: Record<ResponseState, string> = {
  answered: "Answered",
  finalized: "Finalised",
  outstanding: "Outstanding",
  prepared: "Prepared",
  excluded: "Excluded",
};

/**
 * Where one question stands.
 *
 * Order matters. Excluded first, because a question nobody was asked cannot be
 * outstanding. Finalised next, because the team's own answer overrides
 * whatever else is on the row — that is what finalising means.
 */
export function responseState(question: IntakeQuestion): ResponseState {
  if (!question.included) return "excluded";
  if (!isBlank(question.final_answer)) return "finalized";
  if (!isBlank(question.client_answer)) return "answered";
  if (!isBlank(question.prefill_answer)) return "prepared";
  return "outstanding";
}

/**
 * Whether a finalised or pre-filled answer disagrees with the client's.
 *
 * Worth surfacing before kickoff: it is the list of places where we wrote down
 * something different from what they told us, which is either a correction we
 * should mention or a mistake we should undo.
 */
export function needsReview(question: IntakeQuestion): boolean {
  if (!question.included) return false;
  if (isBlank(question.client_answer)) return false;
  if (isBlank(question.final_answer)) return false;
  return (
    JSON.stringify(question.final_answer) !==
    JSON.stringify(question.client_answer)
  );
}

export type ResponseFilter =
  | "all"
  | "outstanding"
  | "answered"
  | "review"
  | "internal";

export const RESPONSE_FILTERS: { key: ResponseFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "outstanding", label: "Outstanding" },
  { key: "answered", label: "Answered" },
  { key: "review", label: "Needs review" },
  { key: "internal", label: "Internal" },
];

export function matchesFilter(
  question: IntakeQuestion,
  filter: ResponseFilter,
): boolean {
  switch (filter) {
    case "all":
      return question.included;
    case "outstanding":
      return question.included && responseState(question) === "outstanding";
    case "answered":
      return (
        question.included &&
        ["answered", "finalized"].includes(responseState(question))
      );
    case "review":
      return needsReview(question);
    case "internal":
      return question.included && !question.client_visible;
  }
}

/* -------------------------------------------------------------------------- */
/* Counts                                                                     */
/* -------------------------------------------------------------------------- */

export interface QuestionnaireProgress {
  total: number;
  included: number;
  excluded: number;
  clientFacing: number;
  internalOnly: number;
  answered: number;
  outstanding: number;
  prefilled: number;
  needsReview: number;
}

export function progress(questions: IntakeQuestion[]): QuestionnaireProgress {
  const included = questions.filter((q) => q.included);
  return {
    total: questions.length,
    included: included.length,
    excluded: questions.length - included.length,
    clientFacing: included.filter((q) => q.client_visible).length,
    internalOnly: included.filter((q) => !q.client_visible).length,
    answered: included.filter((q) =>
      ["answered", "finalized"].includes(responseState(q)),
    ).length,
    outstanding: included.filter((q) => responseState(q) === "outstanding")
      .length,
    prefilled: included.filter((q) => !isBlank(q.prefill_answer)).length,
    needsReview: included.filter(needsReview).length,
  };
}

/* -------------------------------------------------------------------------- */
/* Display                                                                    */
/* -------------------------------------------------------------------------- */

/** An answer as one readable string. Used by the review screen and the PDF. */
export function formatAnswer(value: unknown): string {
  if (isBlank(value)) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

/** The answer the team treats as authoritative, as a string. */
export function authoritativeAnswer(question: IntakeQuestion): string {
  return formatAnswer(effectiveAnswer(question));
}

/** Whether this questionnaire is still on the list. */
export function isArchived(intake: Pick<Intake, "archived_at">): boolean {
  return Boolean(intake.archived_at);
}

/** Sort for the admin list: most recently touched first. */
export function byRecency(a: IntakeWithRelations, b: IntakeWithRelations) {
  return (b.updated_at ?? "").localeCompare(a.updated_at ?? "");
}
