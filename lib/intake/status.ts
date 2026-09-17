import type { IntakeStatus, IntakeQuestion } from "./types";

/**
 * The intake lifecycle.
 *
 * Statuses move forward through the list, with two exceptions that exist
 * because real onboarding is not a straight line: a sent intake can be pulled
 * back to ready, and a submitted one can be reopened for the client if
 * something important was missed.
 */
export const STATUS_ORDER: IntakeStatus[] = [
  "draft",
  "ready",
  "sent",
  "in_progress",
  "submitted",
  "reviewed",
  "complete",
];

export const STATUS_LABELS: Record<IntakeStatus, string> = {
  draft: "Draft",
  ready: "Ready to send",
  sent: "Sent",
  in_progress: "In progress",
  submitted: "Submitted",
  reviewed: "Reviewed",
  complete: "Complete",
};

/**
 * What the Account Manager can do next, given where the intake is.
 *
 * Returned as data rather than rendered as buttons in each page, so the review
 * screen and the list cannot drift apart on what is allowed.
 */
export interface StatusAction {
  to: IntakeStatus;
  label: string;
}

export function availableActions(status: IntakeStatus): StatusAction[] {
  switch (status) {
    case "draft":
      return [{ to: "ready", label: "Mark ready to send" }];
    case "ready":
      return [
        { to: "sent", label: "Mark sent" },
        { to: "draft", label: "Back to draft" },
      ];
    case "sent":
    case "in_progress":
      return [
        { to: "submitted", label: "Mark submitted" },
        { to: "ready", label: "Unsend" },
      ];
    case "submitted":
      return [
        { to: "reviewed", label: "Mark reviewed" },
        { to: "in_progress", label: "Reopen for client" },
      ];
    case "reviewed":
      return [
        { to: "complete", label: "Mark complete" },
        { to: "submitted", label: "Back to submitted" },
      ];
    case "complete":
      return [{ to: "reviewed", label: "Reopen" }];
  }
}

export function canTransition(from: IntakeStatus, to: IntakeStatus): boolean {
  return availableActions(from).some((action) => action.to === to);
}

/** Timestamp columns that should be stamped when entering a status. */
export function timestampsFor(to: IntakeStatus): Record<string, string | null> {
  const now = new Date().toISOString();
  switch (to) {
    case "sent":
      return { sent_at: now };
    case "submitted":
      return { submitted_at: now };
    case "reviewed":
      return { reviewed_at: now };
    case "complete":
      return { completed_at: now };
    default:
      return {};
  }
}

/**
 * The answer the team should treat as authoritative: whatever they finalised,
 * otherwise what the client said, otherwise what we pre-filled.
 */
export function effectiveAnswer(question: IntakeQuestion) {
  return question.final_answer ?? question.client_answer ?? question.prefill_answer ?? null;
}

function isBlank(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * Questions Web Wizards still owes an answer to.
 *
 * required_by_completion never blocked the client from submitting; this is
 * where that debt comes due, as a list to work through at kickoff rather than
 * as a gate anyone had to pass.
 */
export function outstandingQuestions(questions: IntakeQuestion[]): IntakeQuestion[] {
  return questions.filter(
    (q) =>
      q.included &&
      (q.required_mode === "required" ||
        q.required_mode === "required_by_completion") &&
      isBlank(effectiveAnswer(q)),
  );
}
