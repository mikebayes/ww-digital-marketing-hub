import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  Detail,
  DetailGrid,
  Empty,
  Panel,
  Pill,
  Stat,
  StatRow,
} from "@/components/admin/ui";
import { CopyLink } from "@/components/intake/CopyLink";
import {
  PrimaryAction,
  SecondaryAction,
  ShortDate,
} from "@/components/intake/ui";
import { progress, questionnaireTitle, serviceSummary } from "@/lib/intake/admin";
import { getIntake, getIntakeQuestions } from "@/lib/intake/queries";
import { availableActions, outstandingQuestions } from "@/lib/intake/status";
import { clientIntakeUrl, resolveOrigin } from "@/lib/intake/token";
import { setStatusAction } from "../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Overview" };

/**
 * The operational dashboard for one questionnaire.
 *
 * Answers the three questions someone opens it with, in order: where is it,
 * what is still missing, and what do I do next.
 */
export default async function OverviewTab({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const intake = await getIntake(id);
  if (!intake) notFound();

  const questions = await getIntakeQuestions(id);
  const counts = progress(questions);
  const outstanding = outstandingQuestions(questions);
  const actions = availableActions(intake.status);
  const base = `/client-questionnaires/admin/${id}`;

  const requestHeaders = await headers();
  const clientUrl = clientIntakeUrl(
    resolveOrigin(
      requestHeaders.get("host"),
      requestHeaders.get("x-forwarded-proto"),
    ),
    intake.public_token,
  );

  return (
    <div className="space-y-8">
      <StatRow>
        <Stat label="Questions" value={counts.included} />
        <Stat label="Client sees" value={counts.clientFacing} />
        <Stat label="Internal" value={counts.internalOnly} />
        <Stat label="Answered" value={counts.answered} />
        <Stat
          label="Outstanding"
          value={counts.outstanding}
          tone={counts.outstanding > 0 ? "warn" : undefined}
        />
      </StatRow>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Panel title="Questionnaire">
            <DetailGrid>
              <Detail label="Client">{intake.client.name}</Detail>
              <Detail label="Service">{serviceSummary(intake.services)}</Detail>
              <Detail label="Account Manager">
                {intake.account_manager_name || (
                  <span className="text-muted">Not set</span>
                )}
              </Detail>
              <Detail label="Title">
                {questionnaireTitle(intake, intake.services)}
              </Detail>
              <Detail label="Prefilled answers">
                {counts.prefilled} of {counts.included}
              </Detail>
              <Detail label="Excluded">{counts.excluded}</Detail>
            </DetailGrid>
          </Panel>

          <Panel title="Dates">
            <DetailGrid>
              <Detail label="Created">
                <ShortDate value={intake.created_at} />
              </Detail>
              <Detail label="Sent">
                <ShortDate value={intake.sent_at} />
              </Detail>
              <Detail label="Submitted">
                <ShortDate value={intake.submitted_at} />
              </Detail>
              <Detail label="Reviewed">
                <ShortDate value={intake.reviewed_at} />
              </Detail>
              <Detail label="Completed">
                <ShortDate value={intake.completed_at} />
              </Detail>
              <Detail label="Last updated">
                <ShortDate value={intake.updated_at} />
              </Detail>
            </DetailGrid>
          </Panel>

          <Panel
            title={`Outstanding — ${outstanding.length}`}
            padded={outstanding.length === 0}
          >
            {outstanding.length === 0 ? (
              <p className="text-[0.9375rem] text-slate">
                Nothing outstanding. Every question we need an answer to before
                finishing has one.
              </p>
            ) : (
              <ul className="divide-y divide-rule">
                {outstanding.map((question) => (
                  <li
                    key={question.id}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 px-5 py-3.5"
                  >
                    <span className="min-w-0 flex-1 text-[0.9375rem] leading-snug text-charcoal">
                      {question.question_text}
                    </span>
                    <Pill tone={question.client_visible ? "warn" : "quiet"}>
                      {question.client_visible ? "Client" : "Internal"}
                    </Pill>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Client questionnaire link">
            <div className="@container">
              <CopyLink url={clientUrl} />
            </div>
            <p className="mt-4 text-[0.875rem] leading-relaxed text-slate">
              The link is the client&rsquo;s only credential. It works once the
              questionnaire is sent, and never asks them to sign in.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <SecondaryAction href={`/client-questionnaires/admin/preview/${id}`}>
                Preview
              </SecondaryAction>
              <SecondaryAction href={`${base}/document`}>
                Download PDF
              </SecondaryAction>
            </div>
          </Panel>

          <Panel title="Next">
            <div className="flex flex-col gap-3">
              <PrimaryAction href={`${base}/questions`}>
                Edit questions
              </PrimaryAction>

              {actions.map((action, index) => (
                <form key={action.to} action={setStatusAction}>
                  <input type="hidden" name="intake_id" value={id} />
                  <input type="hidden" name="to" value={action.to} />
                  {/*
                   * The first move is the one the lifecycle expects next; the
                   * rest are ways back. Rendering them all as primary buttons
                   * would make "Unsend" look like the thing to do.
                   */}
                  {index === 0 ? (
                    <PrimaryAction>{action.label}</PrimaryAction>
                  ) : (
                    <SecondaryAction>{action.label}</SecondaryAction>
                  )}
                </form>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
