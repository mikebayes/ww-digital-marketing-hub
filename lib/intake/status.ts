import type { IntakeStatus, IntakeQuestion } from "./types";

/**
 * The intake lifecycle.
 *
 * Seven stored statuses, four that staff ever see. The extra three are history
 * — "ready" was a staging step nobody used, "in_progress" is set by the client
 * touching the form, "reviewed" was a stage between submitted and complete
 * that turned out to be the same conversation. They stay in the column so old
 * questionnaires still read correctly and so the client-side transitions that
 * write them keep working; they are folded into a phase before anything is
 * rendered.
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

/** The stored value, for audit surfaces. Not what the admin screens show. */
export const STATUS_LABELS: Record<IntakeStatus, string> = {
  draft: "Draft",
  ready: "Ready to send",
  sent: "Sent",
  in_progress: "In progress",
  submitted: "Submitted",
  reviewed: "Reviewed",
  complete: "Complete",
};

/* -------------------------------------------------------------------------- */
/* What staff see                                                             */
/* -------------------------------------------------------------------------- */

export type StaffPhase = "draft" | "live" | "submitted" | "complete";

export const PHASE_LABELS: Record<StaffPhase, string> = {
  draft: "Draft",
  /*
   * Not "Sent". The application does not send anything — making a
   * questionnaire live opens its URL, and somebody still has to email the
   * link. Calling it Sent claimed an action the tool had not performed.
   */
  live: "Live",
  submitted: "Submitted",
  complete: "Complete",
};

export const PHASE_DESCRIPTIONS: Record<StaffPhase, string> = {
  draft: "Being prepared. The client link does not work yet.",
  live: "The client can open the link and answer.",
  submitted: "The client has sent their answers back.",
  complete: "Finished and on the record.",
};

export function phaseOf(status: IntakeStatus): StaffPhase {
  switch (status) {
    case "draft":
    case "ready":
      return "draft";
    case "sent":
    case "in_progress":
      return "live";
    case "submitted":
    case "reviewed":
      return "submitted";
    case "complete":
      return "complete";
  }
}

/** What the admin screens call a questionnaire. */
export function phaseLabel(status: IntakeStatus): string {
  return PHASE_LABELS[phaseOf(status)];
}

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

/**
 * What the Account Manager can do next.
 *
 * One move forward per phase, and one way back. The old model offered six
 * buttons across four screens for a process with two decisions in it: open the
 * questionnaire to the client, and call it finished.
 *
 * "Mark submitted" is deliberately absent. Submitting is the client's act —
 * the public route writes that status itself when they press the button — and
 * a staff button for it invited someone to declare a questionnaire returned
 * that had not been.
 */
export function availableActions(status: IntakeStatus): StatusAction[] {
  switch (phaseOf(status)) {
    case "draft":
      return [{ to: "sent", label: "Make live" }];
    case "live":
      // Closes the client's link again. Answers already given are kept.
      return [{ to: "draft", label: "Take offline" }];
    case "submitted":
      return [
        { to: "complete", label: "Mark complete" },
        { to: "sent", label: "Reopen for client" },
      ];
    case "complete":
      return [{ to: "submitted", label: "Reopen" }];
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
