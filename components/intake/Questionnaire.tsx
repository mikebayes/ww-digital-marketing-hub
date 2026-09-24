"use client";

import { useState } from "react";
import { AnswerInput } from "./AnswerInput";
import type { PublicIntake } from "@/lib/intake/types";

/**
 * The client questionnaire.
 *
 * Every step is rendered into one form and the inactive ones are hidden rather
 * than unmounted. Moving between steps therefore preserves what has been typed
 * without any state to manage, and a save or submit posts the whole
 * questionnaire regardless of which step the client happens to be on.
 *
 * Progress is shown as "Step 2 of 6" and a rule. Not a count of questions
 * remaining — the client is being asked to help, not to clear a backlog.
 */
export function Questionnaire({
  intake,
  saveAction,
  submitAction,
  readOnly,
  token,
}: {
  intake: PublicIntake;
  /** Carried in the form so every write is addressed by token, never by id. */
  token?: string;
  saveAction?: (formData: FormData) => void | Promise<void>;
  submitAction?: (formData: FormData) => void | Promise<void>;
  readOnly?: boolean;
}) {
  const [active, setActive] = useState(0);
  const steps = intake.steps;
  const onLastStep = active === steps.length - 1;

  if (steps.length === 0) {
    return (
      <p className="text-[0.9375rem] leading-relaxed text-slate">
        There are no questions to answer here yet.
      </p>
    );
  }

  return (
    <form action={submitAction} className="@container">
      {token && <input type="hidden" name="token" value={token} />}
      <nav aria-label="Progress" className="border-b border-rule pb-5">
        <p className="label text-muted">
          Step {active + 1} of {steps.length}
        </p>
        <ol className="mt-3 flex flex-wrap gap-1.5">
          {steps.map((step, index) => (
            <li key={step.title} className="min-w-8 flex-1">
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-current={index === active ? "step" : undefined}
                className={`block h-1 w-full transition-colors ${
                  index === active
                    ? "bg-teal"
                    : index < active
                      ? "bg-teal-deep"
                      : "bg-rule"
                }`}
              >
                <span className="sr-only">{step.title}</span>
              </button>
            </li>
          ))}
        </ol>
        <h2 className="mt-5 text-2xl leading-tight font-semibold tracking-[-0.025em] text-charcoal">
          {steps[active].title}
        </h2>
      </nav>

      {steps.map((step, index) => (
        <div key={step.title} hidden={index !== active}>
          {/*
           * The step's own introduction, above the warning: it says what we
           * are about to do and who we will do it with, which is the context
           * that makes the questions beneath it answerable.
           */}
          {step.intro && (
            <div className="mb-6 max-w-2xl space-y-3 text-[1.0625rem] leading-relaxed text-slate">
              {step.intro.split(/\n\s*\n/).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          )}

          {/*
           * The credentials warning is repeated on any access step, because the
           * intro is a long way up the page by the time someone reaches it and
           * this is the one place they might reach for a password. Matched on
           * the step title so SEO and Paid Media get it too without a second
           * rule being written.
           */}
          {/access/i.test(step.title) && (
            <p className="mb-6 border-l-2 border-charcoal bg-surface px-5 py-4 text-[0.9375rem] leading-relaxed text-charcoal">
              <strong className="font-semibold">
                Please do not enter passwords, authentication codes or security
                answers here.
              </strong>{" "}
              We will never ask for them. Access is granted through each
              platform&rsquo;s own sharing tools, and we will walk you through it.
            </p>
          )}

          <ul className="border-t border-rule">
            {step.questions.map((question) => {
              const fieldId = `q-${question.id}`;
              return (
                <li key={question.id} className="border-b border-rule py-7">
                  <label
                    htmlFor={fieldId}
                    className="block text-[1.0625rem] leading-snug font-medium text-charcoal"
                  >
                    {question.question_text}
                  </label>

                  {question.help_text && (
                    <p className="mt-2 text-[0.9375rem] leading-relaxed text-slate">
                      {question.help_text}
                    </p>
                  )}

                  <div className="mt-4 max-w-2xl">
                    <AnswerInput
                      id={fieldId}
                      name={`answer:${question.id}`}
                      fieldType={question.field_type}
                      options={question.options}
                      value={question.value}
                      disabled={readOnly || !question.editable}
                    />
                  </div>

                  {!question.editable && (
                    <p className="mt-2 text-[0.875rem] text-muted">
                      Shown for reference. Let us know at kickoff if this is wrong.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-rule pt-8">
        {active > 0 && (
          <button
            type="button"
            onClick={() => setActive((step) => step - 1)}
            className="label inline-flex items-center border border-rule-strong px-4 py-3 text-charcoal transition-colors hover:border-charcoal"
          >
            Back
          </button>
        )}

        {!onLastStep && (
          <button
            type="button"
            onClick={() => setActive((step) => step + 1)}
            className="label inline-flex items-center gap-3 bg-charcoal px-5 py-3.5 text-white transition-colors hover:bg-teal-ink"
          >
            Continue
            <span aria-hidden className="h-px w-6 bg-teal" />
          </button>
        )}

        {!readOnly && saveAction && (
          <button
            type="submit"
            formAction={saveAction}
            className="label inline-flex items-center border border-rule-strong px-4 py-3 text-charcoal transition-colors hover:border-charcoal"
          >
            Save progress
          </button>
        )}

        {!readOnly && onLastStep && submitAction && (
          <button
            type="submit"
            className="label inline-flex items-center gap-3 bg-charcoal px-5 py-3.5 text-white transition-colors hover:bg-teal-ink"
          >
            Send to Web Wizards
            <span aria-hidden className="h-px w-6 bg-teal" />
          </button>
        )}
      </div>

      {!readOnly && onLastStep && (
        <p className="mt-4 text-[0.875rem] leading-relaxed text-slate">
          You can send this with questions left blank. Anything missing, we will
          pick up at kickoff.
        </p>
      )}
    </form>
  );
}
