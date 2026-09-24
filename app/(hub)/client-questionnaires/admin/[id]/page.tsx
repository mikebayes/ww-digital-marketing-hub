import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  Detail,
  DetailGrid,
  Panel,
  Stat,
  StatRow,
} from "@/components/admin/ui";
import { CopyLink } from "@/components/intake/CopyLink";
import {
  PrimaryAction,
  SecondaryAction,
  ShortDate,
} from "@/components/intake/ui";
import {
  canMarkComplete,
  needsFollowUp,
  questionnaireTitle,
  serviceSummary,
  summarize,
} from "@/lib/intake/admin";
import { getIntake, getIntakeQuestions } from "@/lib/intake/queries";
import { STATUS_LABELS, availableActions } from "@/lib/intake/status";
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
  const counts = summarize(questions);
  const followUp = needsFollowUp(questions);
  const completable = canMarkComplete(questions);
  const base = `/client-questionnaires/admin/${id}`;

  /*
   * A questionnaire cannot be called finished while we still owe the client an
   * answer to something marked required by completion. The move is hidden here
   * and refused again in the action, because hiding a button is a courtesy and
   * not a rule.
   */
  const actions = availableActions(intake.status).filter(
    (action) => action.to !== "complete" || completable,
  );

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
      {/*
       * Operational facts, not arithmetic. The old strip counted five kinds of
       * record and made "Outstanding 47" the loudest thing on the page, which
       * read as 47 unanswered client questions when most of them were optional.
       */}
      <StatRow>
        <Stat variant="text" label="Status" value={STATUS_LABELS[intake.status]} />
        <Stat variant="text" label="Service" value={serviceSummary(intake.services)} />
        <Stat
          variant="text"
          label="Account Manager"
          value={
            intake.account_manager_name || (
              <span className="text-muted">Not set</span>
            )
          }
        />
        <Stat label="Client questions" value={counts.clientQuestions} />
        <Stat
          variant="text"
          label="Last updated"
          value={<ShortDate value={intake.updated_at} />}
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
              <Detail label="Client questions">
                {counts.clientQuestions} included
                {counts.excluded > 0 && `, ${counts.excluded} excluded`}
              </Detail>
              <Detail label="Prefilled">
                {counts.prefilled} of {counts.clientQuestions}
              </Detail>
              <Detail label="Internal preparation">
                {counts.internalPreparation} fields
              </Detail>
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

          {/*
           * Not "every unanswered question". These are the client questions
           * marked required by completion that neither the client nor we have
           * answered — the list to work through at kickoff, and the reason the
           * questionnaire cannot be marked complete yet.
           */}
          <Panel
            title={`Needs follow-up before completion — ${followUp.length}`}
            action={
              followUp.length > 0 ? (
                <Link
                  href={`${base}/responses?filter=follow-up`}
                  className="label text-teal-ink underline underline-offset-2"
                >
                  Review
                </Link>
              ) : undefined
            }
            padded={followUp.length === 0}
          >
            {followUp.length === 0 ? (
              <p className="text-[0.9375rem] text-slate">
                Nothing to follow up. Every client question we owe an answer to
                before completion has one.
              </p>
            ) : (
              <>
                <ul className="divide-y divide-rule">
                  {followUp.map((question) => (
                    <li
                      key={question.id}
                      className="px-5 py-3.5 text-[0.9375rem] leading-snug text-charcoal"
                    >
                      {question.question_text}
                    </li>
                  ))}
                </ul>
                <p className="border-t border-rule bg-neutral-tint px-5 py-3 text-[0.875rem] leading-relaxed text-slate">
                  The client can submit with these unanswered. The
                  questionnaire cannot be marked complete until each one is
                  resolved, by their answer or by ours.
                </p>
              </>
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
