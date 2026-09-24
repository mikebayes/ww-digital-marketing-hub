import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Meta, Panel, Pill } from "@/components/admin/ui";
import { AnswerInput } from "@/components/intake/AnswerInput";
import {
  PrimaryAction,
  SecondaryAction,
  inputClass,
} from "@/components/intake/ui";
import { groupQuestions, isBlank, progress } from "@/lib/intake/admin";
import { getIntake, getIntakeQuestions } from "@/lib/intake/queries";
import type { IntakeQuestion, Service } from "@/lib/intake/types";
import { saveQuestionsAction } from "../../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Questions" };

const REQUIRED_TONE = {
  required: "neutral",
  required_by_completion: "warn",
  optional: "quiet",
} as const;

const REQUIRED_LABEL = {
  required: "Required",
  required_by_completion: "Required by completion",
  optional: "Optional",
} as const;

/**
 * Preparing the questionnaire before it goes out.
 *
 * The question text is the largest thing on every row, because this screen is
 * read to decide "should we ask this?" — the metadata answers a follow-up
 * question and is sized accordingly. Controls sit to the right rather than in
 * columns, so a long question can use the width it needs.
 */
export default async function QuestionsTab({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;

  const intake = await getIntake(id);
  if (!intake) notFound();

  const questions = await getIntakeQuestions(id);
  const counts = progress(questions);
  const groups = groupQuestions(questions);
  const serviceName = new Map(intake.services.map((s) => [s.id, s.name]));

  return (
    <form action={saveQuestionsAction}>
      <input type="hidden" name="intake_id" value={id} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-[0.875rem] text-slate">
          {counts.included} of {counts.total} included &middot;{" "}
          {counts.clientFacing} client-facing &middot; {counts.internalOnly}{" "}
          internal &middot; {counts.prefilled} prefilled
        </p>
        {saved && (
          <p className="label text-teal-ink" role="status">
            Saved
          </p>
        )}
      </div>

      <div className="mt-5 space-y-6">
        {groups.map((group) => (
          <Panel
            key={group.title}
            title={group.title}
            padded={false}
            action={
              <Pill tone={group.clientFacing ? "quiet" : "neutral"}>
                {group.clientFacing
                  ? `${group.questions.length} questions`
                  : "Internal only"}
              </Pill>
            }
          >
            <ul className="divide-y divide-rule">
              {group.questions.map((question) => (
                <QuestionRow
                  key={question.id}
                  question={question}
                  serviceName={serviceName}
                />
              ))}
            </ul>
          </Panel>
        ))}
      </div>

      <div className="sticky bottom-0 mt-8 flex flex-wrap items-center gap-3 border-t border-rule bg-paper py-5">
        <PrimaryAction>Save changes</PrimaryAction>
        <SecondaryAction href={`/client-questionnaires/admin/preview/${id}`}>
          Preview
        </SecondaryAction>
        <SecondaryAction href={`/client-questionnaires/admin/${id}`}>
          Back to overview
        </SecondaryAction>
      </div>
    </form>
  );
}

function QuestionRow({
  question,
  serviceName,
}: {
  question: IntakeQuestion;
  serviceName: Map<string, Service["name"]>;
}) {
  const prefilled = !isBlank(question.prefill_answer);
  const source = serviceName.get(question.service_id) ?? "Other";

  return (
    <li
      className={`px-5 py-5 transition-colors ${
        question.included ? "" : "bg-neutral-tint/60"
      }`}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <div className="min-w-0">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name={`included:${question.id}`}
              defaultChecked={question.included}
              className="mt-[0.2rem] h-4 w-4 shrink-0 accent-[var(--color-teal-ink)]"
            />
            <span
              className={`text-[0.9375rem] leading-snug font-medium ${
                question.included ? "text-charcoal" : "text-muted line-through"
              }`}
            >
              {question.question_text}
            </span>
          </label>

          {question.help_text && (
            <p className="mt-2 pl-7 text-[0.875rem] leading-relaxed text-slate">
              {question.help_text}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 pl-7">
            {!question.included && <Pill tone="quiet">Excluded</Pill>}
            {!question.client_visible && <Pill tone="neutral">Internal only</Pill>}
            {prefilled && <Pill tone="teal">Prefilled</Pill>}
            <Pill tone={REQUIRED_TONE[question.required_mode]}>
              {REQUIRED_LABEL[question.required_mode]}
            </Pill>
            <Meta>{source}</Meta>
            <Meta>{question.field_type}</Meta>
            {question.client_visible && !question.client_editable && (
              <Meta>Read only for client</Meta>
            )}
          </div>
        </div>

        <div className="min-w-0 lg:pl-4">
          <p className="label text-muted">
            {question.client_visible ? "Prefill" : "Internal preparation"}
          </p>
          <div className="mt-2">
            <AnswerInput
              name={`prefill:${question.id}`}
              fieldType={question.field_type}
              options={question.options ?? []}
              value={question.prefill_answer}
            />
          </div>

          {question.client_visible && (
            <>
              <label
                htmlFor={`notes-${question.id}`}
                className="label mt-4 block text-muted"
              >
                Internal note
              </label>
              <input
                id={`notes-${question.id}`}
                name={`notes:${question.id}`}
                defaultValue={question.internal_notes ?? ""}
                placeholder="Never shown to the client"
                className={`${inputClass} mt-2`}
              />
            </>
          )}
        </div>
      </div>
    </li>
  );
}
