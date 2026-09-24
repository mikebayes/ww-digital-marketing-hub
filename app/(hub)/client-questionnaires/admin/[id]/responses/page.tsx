import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Meta, Panel, Pill } from "@/components/admin/ui";
import { AnswerInput } from "@/components/intake/AnswerInput";
import {
  PrimaryAction,
  SecondaryAction,
  inputClass,
} from "@/components/intake/ui";
import {
  RESPONSE_FILTERS,
  RESPONSE_STATE_LABELS,
  type ResponseFilter,
  formatAnswer,
  groupQuestions,
  isBlank,
  matchesFilter,
  needsReview,
  progress,
  responseState,
} from "@/lib/intake/admin";
import { getIntake, getIntakeQuestions } from "@/lib/intake/queries";
import type { IntakeQuestion } from "@/lib/intake/types";
import { saveResponsesAction } from "../../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Responses" };

/**
 * The review workspace.
 *
 * Deliberately not a results dashboard. There is one client and one set of
 * answers, so there is nothing to aggregate and no chart worth drawing — what
 * this screen is for is working down the questionnaire before kickoff and
 * settling what each answer actually is.
 *
 * The client's words are shown as text and never in an editable field, so the
 * record of what they said cannot be overwritten by someone tidying it up.
 * Corrections go in the finalised answer beside it.
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

  const filter = (RESPONSE_FILTERS.find((f) => f.key === query.filter)?.key ??
    "all") as ResponseFilter;

  const questions = await getIntakeQuestions(id);
  const counts = progress(questions);
  const base = `/client-questionnaires/admin/${id}/responses`;

  const groups = groupQuestions(questions)
    .map((group) => ({
      ...group,
      questions: group.questions.filter((q) => matchesFilter(q, filter)),
    }))
    .filter((group) => group.questions.length > 0);

  const shown = groups.reduce((n, group) => n + group.questions.length, 0);

  return (
    <form action={saveResponsesAction}>
      <input type="hidden" name="intake_id" value={id} />
      <input type="hidden" name="filter" value={filter} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Filter" className="flex flex-wrap gap-1">
          {RESPONSE_FILTERS.map((option) => {
            const active = option.key === filter;
            const count =
              option.key === "all"
                ? counts.included
                : option.key === "outstanding"
                  ? counts.outstanding
                  : option.key === "answered"
                    ? counts.answered
                    : option.key === "review"
                      ? counts.needsReview
                      : counts.internalOnly;

            return (
              <Link
                key={option.key}
                href={option.key === "all" ? base : `${base}?filter=${option.key}`}
                aria-current={active ? "page" : undefined}
                className={`label border px-3 py-2 transition-colors ${
                  active
                    ? "border-charcoal bg-charcoal text-white"
                    : "border-rule-strong text-slate hover:border-charcoal hover:text-charcoal"
                }`}
              >
                {option.label}
                <span className="ml-2 tabular-nums opacity-60">{count}</span>
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
              No questions match this filter.
            </p>
          </Panel>
        ) : (
          groups.map((group) => (
            <Panel
              key={group.title}
              title={group.title}
              padded={false}
              action={
                <Pill tone={group.clientFacing ? "quiet" : "neutral"}>
                  {group.clientFacing
                    ? `${group.questions.length}`
                    : "Internal only"}
                </Pill>
              }
            >
              <ul className="divide-y divide-rule">
                {group.questions.map((question) => (
                  <ResponseRow key={question.id} question={question} />
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

function ResponseRow({ question }: { question: IntakeQuestion }) {
  const state = responseState(question);
  const clientAnswer = formatAnswer(question.client_answer);
  const prefill = formatAnswer(question.prefill_answer);
  const review = needsReview(question);

  return (
    <li className="px-5 py-5">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <p className="min-w-0 flex-1 text-[0.9375rem] leading-snug font-medium text-charcoal">
          {question.question_text}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {review && <Pill tone="warn">Needs review</Pill>}
          <Pill
            tone={
              state === "outstanding"
                ? "warn"
                : state === "finalized"
                  ? "teal"
                  : state === "answered"
                    ? "neutral"
                    : "quiet"
            }
          >
            {RESPONSE_STATE_LABELS[state]}
          </Pill>
          {!question.client_visible && <Meta>Internal</Meta>}
        </div>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          {question.client_visible && (
            <div>
              <p className="label text-muted">Client response</p>
              {clientAnswer ? (
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed whitespace-pre-line text-charcoal">
                  {clientAnswer}
                </p>
              ) : (
                <p className="mt-1.5 text-[0.9375rem] text-muted">
                  No answer given
                </p>
              )}
            </div>
          )}

          {prefill && (
            <div>
              <p className="label text-muted">
                {question.client_visible ? "Prefilled" : "Internal preparation"}
              </p>
              <p className="mt-1.5 text-[0.9375rem] leading-relaxed whitespace-pre-line text-slate">
                {prefill}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="label text-muted">Finalised answer</p>
            <div className="mt-2">
              <AnswerInput
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
