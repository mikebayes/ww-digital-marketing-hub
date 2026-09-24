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
  clientQuestions,
  groupQuestions,
  internalPreparation,
  isBlank,
  summarize,
} from "@/lib/intake/admin";
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
 * Two views, not one list. What the client is asked and what we write to
 * ourselves are different jobs: the first is a decision about what to send,
 * the second is note-taking. Showing them together made "Internal preparation"
 * read as a seventh section of the client's questionnaire.
 *
 * Rows are compact and closed by default. Every prefill box open at once made
 * a screen you had to read rather than scan, and the question is the thing
 * being decided about — so the question is what the row shows.
 */
export default async function QuestionsTab({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string; saved?: string }>;
}) {
  const { id } = await params;
  const { view, saved } = await searchParams;

  const intake = await getIntake(id);
  if (!intake) notFound();

  const questions = await getIntakeQuestions(id);
  const counts = summarize(questions);
  const serviceName = new Map(intake.services.map((s) => [s.id, s.name]));

  const internalView = view === "internal";
  const base = `/client-questionnaires/admin/${id}/questions`;
  const visible = internalView
    ? internalPreparation(questions)
    : clientQuestions(questions);
  const groups = groupQuestions(visible);

  return (
    <form action={saveQuestionsAction}>
      <input type="hidden" name="intake_id" value={id} />
      <input type="hidden" name="view" value={internalView ? "internal" : ""} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Question set" className="flex flex-wrap gap-1">
          <ViewLink href={base} active={!internalView}>
            Client questions
            <Count>{counts.clientQuestions}</Count>
          </ViewLink>
          <ViewLink href={`${base}?view=internal`} active={internalView}>
            Internal preparation
            <Count>{counts.internalPreparation}</Count>
          </ViewLink>
        </nav>

        {saved && (
          <p className="label text-teal-ink" role="status">
            Saved
          </p>
        )}
      </div>

      {internalView ? (
        <>
          <p className="mt-5 border-l-2 border-charcoal bg-neutral-tint px-4 py-3 text-[0.875rem] leading-relaxed text-charcoal">
            <strong className="font-semibold">Internal only.</strong> Never
            shown to the client, on the questionnaire or anywhere else. These
            are the notes we take before kickoff, not questions we are deciding
            whether to send.
          </p>

          <div className="mt-5 space-y-6">
            {groups.map((group) => (
              <Panel key={group.title} title={group.title}>
                <div className="space-y-6">
                  {group.questions.map((question) => (
                    <InternalField key={question.id} question={question} />
                  ))}
                </div>
              </Panel>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="mt-5 text-[0.875rem] text-slate">
            {counts.clientQuestions} client questions included
            {counts.excluded > 0 && ` · ${counts.excluded} excluded`}
            {counts.prefilled > 0 && ` · ${counts.prefilled} prefilled`}
          </p>

          <div className="mt-4 space-y-6">
            {groups.map((group) => (
              <Panel
                key={group.title}
                title={group.title}
                padded={false}
                action={
                  <span className="label text-muted tabular-nums">
                    {group.questions.filter((q) => q.included).length} of{" "}
                    {group.questions.length}
                  </span>
                }
              >
                <ul className="divide-y divide-rule">
                  {group.questions.map((question) => (
                    <ClientQuestionRow
                      key={question.id}
                      question={question}
                      serviceName={serviceName}
                    />
                  ))}
                </ul>
              </Panel>
            ))}
          </div>
        </>
      )}

      <div className="sticky bottom-0 mt-8 flex flex-wrap items-center gap-3 border-t border-rule bg-paper py-5">
        <PrimaryAction>Save changes</PrimaryAction>
        <SecondaryAction href={`/client-questionnaires/admin/preview/${id}`}>
          Preview
        </SecondaryAction>
        <SecondaryAction href={`/client-questionnaires/admin/${id}`}>
          Back to overview
        </SecondaryAction>
        <p className="text-[0.8125rem] text-muted">
          Saves the {internalView ? "internal preparation" : "client questions"}{" "}
          shown here.
        </p>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */

function ViewLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`label inline-flex items-center border px-3.5 py-2.5 transition-colors ${
        active
          ? "border-charcoal bg-charcoal text-white"
          : "border-rule-strong text-slate hover:border-charcoal hover:text-charcoal"
      }`}
    >
      {children}
    </Link>
  );
}

function Count({ children }: { children: React.ReactNode }) {
  return <span className="ml-2 tabular-nums opacity-60">{children}</span>;
}

/**
 * One client question.
 *
 * The checkbox sits outside the disclosure so including or excluding never
 * costs an expand, and the disclosure is plain <details> so the row opens
 * without JavaScript and its fields still post while closed.
 */
function ClientQuestionRow({
  question,
  serviceName,
}: {
  question: IntakeQuestion;
  serviceName: Map<string, Service["name"]>;
}) {
  const prefilled = !isBlank(question.prefill_answer);

  return (
    <li className={question.included ? "" : "bg-neutral-tint/50"}>
      <div className="flex items-start gap-3 px-5 py-3">
        {/*
         * Marks this question as rendered. The save action writes only what was
         * on screen, so switching to Internal preparation and saving cannot
         * silently exclude every client question that was not displayed.
         */}
        <input type="hidden" name={`present:${question.id}`} value="1" />

        <input
          type="checkbox"
          id={`inc-${question.id}`}
          name={`included:${question.id}`}
          defaultChecked={question.included}
          aria-label={`Include: ${question.question_text}`}
          className="mt-[0.3rem] h-4 w-4 shrink-0 accent-[var(--color-teal-ink)]"
        />

        <details className="min-w-0 flex-1">
          <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-2 [&::-webkit-details-marker]:hidden">
            <span
              className={`min-w-0 flex-1 text-[0.9375rem] leading-snug ${
                question.included
                  ? "font-medium text-charcoal"
                  : "text-muted line-through"
              }`}
            >
              {question.question_text}
            </span>

            {!question.included && <Pill tone="quiet">Excluded</Pill>}
            {prefilled && <Pill tone="teal">Prefilled</Pill>}
            {question.required_mode !== "required" && (
              <Pill tone={REQUIRED_TONE[question.required_mode]}>
                {REQUIRED_LABEL[question.required_mode]}
              </Pill>
            )}
            {question.required_mode === "required" && (
              <Pill tone="neutral">Required</Pill>
            )}

            <span className="label shrink-0 text-teal-ink">Configure</span>
          </summary>

          <div className="mt-4 mb-2 grid gap-5 border-l-2 border-rule pl-4 lg:grid-cols-2">
            <div>
              <label
                htmlFor={`prefill-${question.id}`}
                className="label block text-muted"
              >
                Prefill
              </label>
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">
                What we already know. The client can review and change it.
              </p>
              <div className="mt-2">
                <AnswerInput
                  name={`prefill:${question.id}`}
                  fieldType={question.field_type}
                  options={question.options ?? []}
                  value={question.prefill_answer}
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
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">
                Never shown to the client.
              </p>
              <input
                id={`note-${question.id}`}
                name={`notes:${question.id}`}
                defaultValue={question.internal_notes ?? ""}
                className={`${inputClass} mt-2`}
              />

              {question.help_text && (
                <p className="mt-4 text-[0.8125rem] leading-relaxed text-slate">
                  <span className="label text-muted">Help text</span>{" "}
                  {question.help_text}
                </p>
              )}

              <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                <span className="label text-muted">
                  {serviceName.get(question.service_id) ?? "Other"}
                </span>
                <span className="label text-muted">{question.field_type}</span>
                {!question.client_editable && (
                  <span className="label text-muted">Read only for client</span>
                )}
              </p>
            </div>
          </div>
        </details>
      </div>
    </li>
  );
}

/**
 * One internal preparation field.
 *
 * A working form, not a questionnaire row. No include checkbox: these are
 * always part of the record, and asking the Account Manager whether to "send"
 * a note they are writing to themselves was a control with no meaning.
 */
function InternalField({ question }: { question: IntakeQuestion }) {
  return (
    <div>
      <input type="hidden" name={`present:${question.id}`} value="1" />
      {/* Always included. The AM is not deciding whether to send these. */}
      <input type="hidden" name={`included:${question.id}`} value="on" />

      <label
        htmlFor={`prep-${question.id}`}
        className="block text-[0.9375rem] leading-snug font-medium text-charcoal"
      >
        {question.question_text}
      </label>
      {question.help_text && (
        <p className="mt-1.5 text-[0.875rem] leading-relaxed text-slate">
          {question.help_text}
        </p>
      )}
      <div className="mt-2.5">
        <AnswerInput
          id={`prep-${question.id}`}
          name={`prefill:${question.id}`}
          fieldType={question.field_type}
          options={question.options ?? []}
          value={question.prefill_answer}
        />
      </div>
    </div>
  );
}
