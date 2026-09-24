import { NextResponse } from "next/server";
import {
  authoritativeAnswer,
  documentFileName,
  formatAnswer,
  groupQuestions,
  questionnaireTitle,
  serviceSummary,
} from "@/lib/intake/admin";
import { getIntake, getIntakeQuestions } from "@/lib/intake/queries";
import { STATUS_LABELS } from "@/lib/intake/status";
import type { IntakeQuestion } from "@/lib/intake/types";

export const dynamic = "force-dynamic";

/**
 * The intake as a durable document, for Productive → Docs.
 *
 * A route handler rather than a page because layouts do not apply to one: this
 * has to be a whole HTML document with its own print rules, and nesting it
 * inside the Hub shell would put the rail in the margin of every page.
 *
 * It opens with the print dialogue and is saved as a PDF from there. There is
 * no headless browser in this deployment, and adding one to render a document
 * the browser can already render would be a large dependency for no gain. The
 * <title> is the filename the save dialogue offers, which is why it carries the
 * naming convention rather than a heading.
 *
 * INTERNAL. It carries internal notes and our finalised answers, so it is
 * labelled as such on every page and must not be sent to a client.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const intake = await getIntake(id);
  if (!intake) return new NextResponse("Not found", { status: 404 });

  const questions = await getIntakeQuestions(id);
  const groups = groupQuestions(questions).map((group) => ({
    ...group,
    questions: group.questions.filter((question) => question.included),
  }));

  const fileName = documentFileName(intake.client.name, intake.services);
  const completed = intake.completed_at ?? intake.submitted_at;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${escapeHtml(fileName)}</title>
<style>
  @page { size: letter; margin: 18mm 16mm; }
  :root {
    --charcoal: #1c1f23; --slate: #4a4f57; --muted: #6e757d;
    --rule: #e4e7ea; --teal: #3abfaf; --teal-ink: #1f7d73;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: #fff; color: var(--charcoal);
    font: 10.5pt/1.55 -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .sheet { max-width: 46rem; margin: 0 auto; padding: 2.5rem 1.5rem 4rem; }
  .bar {
    background: var(--charcoal); color: #fff; padding: .55rem .9rem;
    font-size: 8pt; letter-spacing: .16em; text-transform: uppercase; font-weight: 600;
  }
  h1 { font-size: 20pt; line-height: 1.15; letter-spacing: -.02em; margin: 1.4rem 0 .35rem; }
  .sub { color: var(--slate); font-size: 11pt; margin: 0 0 1.4rem; }
  .meta { border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule);
          display: grid; grid-template-columns: repeat(3, 1fr); gap: .9rem 1.5rem; padding: .9rem 0; margin-bottom: 2rem; }
  .meta dt { font-size: 7.5pt; letter-spacing: .16em; text-transform: uppercase; font-weight: 600; color: var(--muted); }
  .meta dd { margin: .25rem 0 0; font-size: 10pt; }
  h2 { font-size: 12pt; letter-spacing: -.01em; margin: 2rem 0 .75rem;
       padding-bottom: .4rem; border-bottom: 2px solid var(--charcoal); page-break-after: avoid; }
  .q { padding: .7rem 0; border-bottom: 1px solid var(--rule); page-break-inside: avoid; }
  .q p.text { margin: 0 0 .35rem; font-weight: 600; }
  .q p.answer { margin: 0; color: var(--slate); white-space: pre-line; }
  .q p.blank { margin: 0; color: var(--muted); font-style: italic; }
  .q p.note { margin: .4rem 0 0; padding-left: .7rem; border-left: 2px solid var(--teal);
              color: var(--slate); font-size: 9.5pt; }
  .tag { font-size: 7.5pt; letter-spacing: .14em; text-transform: uppercase;
         font-weight: 600; color: var(--teal-ink); }
  footer { margin-top: 2.5rem; padding-top: .8rem; border-top: 1px solid var(--rule);
           color: var(--muted); font-size: 9pt; }
  .toolbar { position: sticky; top: 0; background: #f2f3f4; border-bottom: 1px solid var(--rule);
             padding: .7rem 1rem; display: flex; gap: .75rem; align-items: center; justify-content: center; }
  .toolbar button, .toolbar a {
    font: inherit; font-size: 8pt; letter-spacing: .16em; text-transform: uppercase; font-weight: 600;
    padding: .6rem 1.1rem; border: 1px solid var(--charcoal); background: var(--charcoal);
    color: #fff; cursor: pointer; text-decoration: none;
  }
  .toolbar a { background: #fff; color: var(--charcoal); }
  @media print { .toolbar { display: none; } }
</style>
</head>
<body>
<div class="toolbar">
  <button type="button" onclick="window.print()">Save as PDF</button>
  <a href="/client-questionnaires/admin/${escapeHtml(id)}">Back to questionnaire</a>
</div>

<div class="sheet">
  <p class="bar">Internal &middot; Web Wizards</p>

  <h1>Client ${escapeHtml(serviceSummary(intake.services))} Intake</h1>
  <p class="sub">${escapeHtml(intake.client.name)}</p>

  <dl class="meta">
    <div><dt>Client</dt><dd>${escapeHtml(intake.client.name)}</dd></div>
    <div><dt>Service</dt><dd>${escapeHtml(serviceSummary(intake.services))}</dd></div>
    <div><dt>Account Manager</dt><dd>${escapeHtml(intake.account_manager_name ?? "Not set")}</dd></div>
    <div><dt>Questionnaire</dt><dd>${escapeHtml(questionnaireTitle(intake, intake.services))}</dd></div>
    <div><dt>Status</dt><dd>${escapeHtml(STATUS_LABELS[intake.status])}</dd></div>
    <div><dt>${completed === intake.completed_at && intake.completed_at ? "Completed" : "Submitted"}</dt><dd>${escapeHtml(longDate(completed))}</dd></div>
  </dl>

  ${groups
    .filter((group) => group.questions.length > 0)
    .map(
      (group) => `<section>
    <h2>${escapeHtml(group.title)}${group.clientFacing ? "" : ' <span class="tag">Internal</span>'}</h2>
    ${group.questions.map(renderQuestion).join("\n")}
  </section>`,
    )
    .join("\n")}

  <footer>
    Internal Web Wizards document. Contains our own notes and finalised
    answers; not for the client. Generated ${escapeHtml(longDate(new Date().toISOString()))}.
  </footer>
</div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}

/* -------------------------------------------------------------------------- */

/**
 * One question and the answer we are going with.
 *
 * Finalised beats the client's words, which beat what we pre-filled — the same
 * order as effectiveAnswer(), because a document that disagreed with the admin
 * screen would be worse than no document.
 */
function renderQuestion(question: IntakeQuestion): string {
  const answer = authoritativeAnswer(question);
  const clientSaid = formatAnswer(question.client_answer);
  const finalised = formatAnswer(question.final_answer);

  // Worth showing when we wrote something different from what they told us:
  // that is a conversation to have, and the document is what it happens over.
  const superseded =
    finalised && clientSaid && finalised !== clientSaid ? clientSaid : "";

  return `<div class="q">
  <p class="text">${escapeHtml(question.question_text)}${
    question.client_visible ? "" : ' <span class="tag">Internal</span>'
  }</p>
  ${
    answer
      ? `<p class="answer">${escapeHtml(answer)}</p>`
      : `<p class="blank">No answer recorded</p>`
  }
  ${superseded ? `<p class="note">Client originally said: ${escapeHtml(superseded)}</p>` : ""}
  ${question.internal_notes ? `<p class="note">Internal note: ${escapeHtml(question.internal_notes)}</p>` : ""}
</div>`;
}

function longDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Everything interpolated above is client-supplied text. All of it escapes. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
