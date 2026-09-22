import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PageHeader, Section, SectionLabel } from "@/components/hub/primitives";
import { AnswerInput, AnswerText } from "@/components/intake/AnswerInput";
import { CopyLink } from "@/components/intake/CopyLink";
import {
  EmptyState,
  Notice,
  PrimaryAction,
  SecondaryAction,
  ShortDate,
  StatusMark,
  textareaClass,
} from "@/components/intake/ui";
import { getIntake, getIntakeQuestions } from "@/lib/intake/queries";
import { availableActions, effectiveAnswer, outstandingQuestions, STATUS_LABELS } from "@/lib/intake/status";
import { clientIntakeUrl, resolveOrigin } from "@/lib/intake/token";
import type { IntakeQuestion } from "@/lib/intake/types";
import { saveFinalAnswersAction, setStatusAction } from "../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Intake" };

/**
 * The internal record of one intake.
 *
 * Shows the three answers a question can have side by side — what we guessed,
 * what the client said, and what the team settled on — because the interesting
 * cases are the ones where they disagree.
 */
export default async function IntakePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const intake = await getIntake(id);
  if (!intake) notFound();

  const questions = await getIntakeQuestions(id);
  const requestHeaders = await headers();
  const clientUrl = clientIntakeUrl(
    resolveOrigin(
      requestHeaders.get("host"),
      requestHeaders.get("x-forwarded-proto"),
    ),
    intake.public_token,
  );

  const actions = availableActions(intake.status);
  const outstanding = outstandingQuestions(questions);
  const included = questions.filter((q) => q.included);
  const clientFacing = included.filter((q) => q.client_visible);
  const internalOnly = included.filter((q) => !q.client_visible);
  const afterSubmission =
    intake.status === "submitted" ||
    intake.status === "reviewed" ||
    intake.status === "complete";

  const serviceName = new Map(intake.services.map((s) => [s.id, s.name]));

  return (
    <div className="px-6 pt-10 pb-4 md:px-12 lg:px-16 lg:pt-14">
      <PageHeader
        title={intake.client.name}
        lede="The internal record for this onboarding questionnaire."
        breadcrumb={[
          { label: "Hub", href: "/" },
          { label: "Intakes", href: "/intakes" },
          { label: intake.client.name },
        ]}
        meta={[
          { label: "Status", value: STATUS_LABELS[intake.status] },
          {
            label: "Services",
            value:
              intake.services
                .filter((s) => s.slug !== "common")
                .map((s) => s.name)
                .join(", ") || "Common only",
          },
          { label: "Account Manager", value: intake.account_manager_name || "Unassigned" },
          {
            label: "Questions included",
            value: `${included.length} of ${questions.length}`,
          },
        ]}
      />

      {error === "transition" && (
        <p className="mt-8 border-l-2 border-charcoal bg-surface px-4 py-3 text-[0.9375rem] text-charcoal">
          That status change is no longer available. The intake has moved on
          since this page was loaded.
        </p>
      )}

      <div className="@container mt-12 space-y-12">
        {/* ------------------------------------------------------------------ */}
        <Section id="lifecycle" marker="01" title="Where It Is">
          <dl className="grid gap-px border border-rule bg-rule @md:grid-cols-4">
            {[
              { label: "Sent", value: intake.sent_at },
              { label: "Submitted", value: intake.submitted_at },
              { label: "Reviewed", value: intake.reviewed_at },
              { label: "Completed", value: intake.completed_at },
            ].map((item) => (
              <div key={item.label} className="bg-surface px-4 py-3.5">
                <dt className="label text-muted">{item.label}</dt>
                <dd className="mt-1.5 text-[0.8125rem] font-medium text-charcoal">
                  <ShortDate value={item.value} />
                </dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap items-center gap-3">
            {actions.map((action, index) => (
              <form key={action.to} action={setStatusAction}>
                <input type="hidden" name="intake_id" value={id} />
                <input type="hidden" name="to" value={action.to} />
                {index === 0 ? (
                  <PrimaryAction>{action.label}</PrimaryAction>
                ) : (
                  <SecondaryAction>{action.label}</SecondaryAction>
                )}
              </form>
            ))}
            <SecondaryAction href={`/intakes/${id}/edit`}>
              Edit questions
            </SecondaryAction>
            <SecondaryAction href={`/intakes/${id}/preview`}>Preview</SecondaryAction>
          </div>
        </Section>

        {/* ------------------------------------------------------------------ */}
        <Section
          id="link"
          marker="02"
          title="Client Link"
          intro={
            <p>
              Anyone with this link can fill in the questionnaire, so treat it
              like a password. It goes live once the intake is marked sent.
            </p>
          }
        >
          <CopyLink url={clientUrl} />
          {(intake.status === "draft" || intake.status === "ready") && (
            <Notice>
              <p>
                This link is not live yet. Mark the intake{" "}
                <strong>sent</strong> and the client will be able to open it.
              </p>
            </Notice>
          )}
        </Section>

        {/* ------------------------------------------------------------------ */}
        {outstanding.length > 0 && (
          <Section
            id="outstanding"
            marker="03"
            title="Still Outstanding"
            intro={
              <p>
                Questions we said we would resolve before finishing. These never
                blocked the client from submitting — they are the kickoff list.
              </p>
            }
          >
            <ul className="border-t border-rule">
              {outstanding.map((question) => (
                <li
                  key={question.id}
                  className="border-b border-rule py-3.5 text-[0.9375rem] text-charcoal"
                >
                  {question.question_text}
                  <span className="label ml-3 text-muted">
                    {serviceName.get(question.service_id) ?? ""}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* ------------------------------------------------------------------ */}
        <Section
          id="answers"
          marker={outstanding.length > 0 ? "04" : "03"}
          title="Answers"
          intro={
            <p>
              What we pre-filled, what the client sent back, and what the team
              settled on. The final answer is the one the account runs from.
            </p>
          }
        >
          {clientFacing.length === 0 ? (
            <EmptyState>No client-facing questions are included.</EmptyState>
          ) : (
            <form action={saveFinalAnswersAction}>
              <input type="hidden" name="intake_id" value={id} />

              <ul className="border-t border-rule">
                {clientFacing.map((question) => (
                  <AnswerRow
                    key={question.id}
                    question={question}
                    editable={afterSubmission}
                  />
                ))}
              </ul>

              {afterSubmission && (
                <div className="mt-8">
                  <PrimaryAction>Save final answers</PrimaryAction>
                </div>
              )}
            </form>
          )}
        </Section>

        {/* ------------------------------------------------------------------ */}
        {internalOnly.length > 0 && (
          <Section
            id="internal"
            marker={outstanding.length > 0 ? "05" : "04"}
            title="Internal Preparation"
            intro={<p>Never shown to the client, on any screen they can reach.</p>}
          >
            <ul className="border-t border-rule">
              {internalOnly.map((question) => (
                <li key={question.id} className="border-b border-rule py-5">
                  <p className="text-[0.9375rem] font-medium text-charcoal">
                    {question.question_text}
                  </p>
                  <div className="mt-2 text-[0.9375rem] leading-relaxed text-slate">
                    <AnswerText value={question.prefill_answer} />
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </div>
  );
}

/** One question with its three answers, plus the internal note. */
function AnswerRow({
  question,
  editable,
}: {
  question: IntakeQuestion;
  editable: boolean;
}) {
  return (
    <li className="border-b border-rule py-6">
      <p className="text-[0.9375rem] leading-snug font-medium text-charcoal">
        {question.question_text}
      </p>

      <div className="mt-4 grid gap-6 @3xl:grid-cols-3">
        <div>
          <SectionLabel tone="muted">We pre-filled</SectionLabel>
          <div className="mt-2 text-[0.9375rem] leading-relaxed text-slate">
            <AnswerText value={question.prefill_answer} />
          </div>
        </div>

        <div>
          <SectionLabel tone="muted">Client said</SectionLabel>
          <div className="mt-2 text-[0.9375rem] leading-relaxed text-slate">
            <AnswerText value={question.client_answer} />
          </div>
        </div>

        <div>
          <SectionLabel tone="muted">Final</SectionLabel>
          <div className="mt-2">
            {editable ? (
              <AnswerInput
                name={`final:${question.id}`}
                fieldType={question.field_type}
                options={question.options ?? []}
                value={effectiveAnswer(question)}
              />
            ) : (
              <div className="text-[0.9375rem] leading-relaxed text-slate">
                <AnswerText value={question.final_answer} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <SectionLabel tone="muted">Internal note</SectionLabel>
        <div className="mt-2 max-w-2xl">
          {editable ? (
            <textarea
              name={`notes:${question.id}`}
              defaultValue={question.internal_notes ?? ""}
              rows={2}
              className={textareaClass}
            />
          ) : (
            <p className="text-[0.9375rem] leading-relaxed text-slate">
              {question.internal_notes || <span className="text-muted">—</span>}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}
