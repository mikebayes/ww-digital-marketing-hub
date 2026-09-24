import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Panel, Pill } from "@/components/admin/ui";
import { AnswerInput } from "@/components/intake/AnswerInput";
import {
  PrimaryAction,
  SecondaryAction,
  inputClass,
} from "@/components/intake/ui";
import {
  DEFAULT_REVIEW_FILTER,
  REVIEW_FILTERS,
  formatAnswer,
  groupQuestions,
  isBlank,
  matchesReview,
  needsReview,
  parseReviewFilter,
  responseState,
  reviewCount,
} from "@/lib/intake/admin";
import { getIntake, getIntakeQuestions, listContacts } from "@/lib/intake/queries";
import type { IntakeQuestion } from "@/lib/intake/types";
import { saveResponsesAction } from "../../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Responses" };

/**
 * The review workspace.
 *
 * Deliberately not a results dashboard. There is one client and one set of
 * answers, so there is nothing to aggregate and no chart worth drawing — what
 * this is for is working down the questionnaire before kickoff and settling
 * what each answer actually is.
 *
 * It opens on the client's responses. Leading with internal preparation made
 * the page read as a review of our own notes, which is the last thing anyone
 * comes here to do.
 *
 * The client's words are text and never an editable field, so the record of
 * what they said cannot be overwritten by someone tidying it up. Corrections
 * go in the finalised answer beside it.
 */
export default async function ResponsesTab({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ filter?: string; saved?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;

  const intake = await getIntake(id);
  if (!intake) notFound();

  const filter = parseReviewFilter(query.filter);
  const questions = await getIntakeQuestions(id);
  const contactNames = new Map(
    (await listContacts(id)).map((contact) => [contact.id, contact.name]),
  );
  const base = `/client-questionnaires/admin/${id}/responses`;

  const groups = groupQuestions(
    questions.filter((question) => matchesReview(question, filter)),
  );
  const shown = groups.reduce((n, group) => n + group.questions.length, 0);

  return (
    <form action={saveResponsesAction}>
      <input type="hidden" name="intake_id" value={id} />
      <input type="hidden" name="filter" value={filter} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Review" className="flex flex-wrap gap-1">
          {REVIEW_FILTERS.map((option) => {
            const active = option.key === filter;
            return (
              <Link
                key={option.key}
                href={
                  option.key === DEFAULT_REVIEW_FILTER
                    ? base
                    : `${base}?filter=${option.key}`
                }
                aria-current={active ? "page" : undefined}
                className={`label border px-3.5 py-2.5 transition-colors ${
                  active
                    ? "border-charcoal bg-charcoal text-white"
                    : "border-rule-strong text-slate hover:border-charcoal hover:text-charcoal"
                }`}
              >
                {option.label}
                <span className="ml-2 tabular-nums opacity-60">
                  {reviewCount(questions, option.key)}
                </span>
              </Link>
            );
          })}
        </nav>

        {query.saved && (
          <p className="label text-teal-ink" role="status">
            Saved
          </p>
        )}
      </div>

      <div className="mt-5 space-y-6">
        {shown === 0 ? (
          <Panel title="Nothing to show">
            <p className="text-[0.9375rem] text-slate">
              {filter === "follow-up"
                ? "Nothing needs following up. Every question we owe an answer to before completion has one."
                : "No questions match this view."}
            </p>
          </Panel>
        ) : (
          groups.map((group) => (
            <Panel
              key={group.title}
              title={group.title}
              padded={false}
              action={
                <span className="label text-muted tabular-nums">
                  {group.questions.length}
                </span>
              }
            >
              <ul className="divide-y divide-rule">
                {group.questions.map((question) => (
                  <ResponseRow
                    key={question.id}
                    question={question}
                    contactNames={contactNames}
                  />
                ))}
              </ul>
            </Panel>
          ))
        )}
      </div>

      <div className="sticky bottom-0 mt-8 flex flex-wrap items-center gap-3 border-t border-rule bg-paper py-5">
        <PrimaryAction>Save review</PrimaryAction>
        <SecondaryAction href={`/client-questionnaires/admin/${id}`}>
          Back to overview
        </SecondaryAction>
        <p className="text-[0.8125rem] text-muted">
          Saves the {shown} question{shown === 1 ? "" : "s"} shown.
        </p>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */

function ResponseRow({
  question,
  contactNames,
}: {
  question: IntakeQuestion;
  contactNames: Map<string, string>;
}) {
  const state = responseState(question);
  const clientAnswer = formatAnswer(question.client_answer);
  const prefill = formatAnswer(question.prefill_answer);
  const review = needsReview(question);
  const followUp =
    question.required_mode === "required_by_completion" &&
    isBlank(question.client_answer) &&
    isBlank(question.final_answer);

  /*
   * Who last wrote the client's answer. Several people share the
   * questionnaire, so "the client said" is not specific enough to act on.
   */
  const attribution = clientAnswer
    ? question.answered_at
      ? `${question.answer_revision_count > 1 ? "Updated" : "Provided"} by ${
          contactNames.get(question.answered_by_contact_id ?? "") ??
          "a contributor we did not record"
        } · ${new Date(question.answered_at).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}`
      : "Provided before contributors were recorded"
    : null;

  return (
    <li className="px-5 py-5">
      <input type="hidden" name={`present:${question.id}`} value="1" />

      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <p className="min-w-0 flex-1 text-[0.9375rem] leading-snug font-medium text-charcoal">
          {question.question_text}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {review && <Pill tone="warn">Changed from client</Pill>}
          {followUp && <Pill tone="warn">Needs follow-up</Pill>}
          {!followUp && (
            <Pill
              tone={
                state === "finalized"
                  ? "teal"
                  : state === "answered"
                    ? "neutral"
                    : "quiet"
              }
            >
              {state === "finalized"
                ? "Finalised"
                : state === "answered"
                  ? "Answered"
                  : state === "prepared"
                    ? "Prefilled"
                    : "No answer"}
            </Pill>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
              <p className="label text-muted">Client response</p>
              {clientAnswer ? (
                <p className="mt-1.5 rounded-none border-l-2 border-rule-strong pl-3 text-[0.9375rem] leading-relaxed whitespace-pre-line text-charcoal">
                  {clientAnswer}
                </p>
              ) : (
                <p className="mt-1.5 text-[0.9375rem] text-muted">
                  Not answered
                </p>
              )}
              {attribution && (
                <p className="mt-2 text-[0.8125rem] text-muted">
                  {attribution}
                </p>
              )}
            </div>

          {prefill && (
            <div>
              <p className="label text-muted">Prefilled answer</p>
              <p className="mt-1.5 text-[0.9375rem] leading-relaxed whitespace-pre-line text-slate">
                {prefill}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor={`final-${question.id}`}
              className="label block text-muted"
            >
              Finalised answer
            </label>
            <div className="mt-2">
              <AnswerInput
                id={`final-${question.id}`}
                name={`final:${question.id}`}
                fieldType={question.field_type}
                options={question.options ?? []}
                value={
                  isBlank(question.final_answer)
                    ? question.client_answer
                    : question.final_answer
                }
              />
            </div>
          </div>

          <div>
            <label
              htmlFor={`note-${question.id}`}
              className="label block text-muted"
            >
              Internal note
            </label>
            <input
              id={`note-${question.id}`}
              name={`notes:${question.id}`}
              defaultValue={question.internal_notes ?? ""}
              placeholder="Never shown to the client"
              className={`${inputClass} mt-2`}
            />
          </div>
        </div>
      </div>
    </li>
  );
}
