import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientIntro, ClientShell } from "@/components/intake/ClientShell";
import { Questionnaire } from "@/components/intake/Questionnaire";
import { getIntake, getIntakeQuestions } from "@/lib/intake/queries";
import { toPublicIntake } from "@/lib/intake/public";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Preview" };

/**
 * Preview.
 *
 * Runs the internal snapshot through the same projection the public route uses
 * and hands it to the same component, so this is the client's page rather than
 * a drawing of it. If a question is excluded or internal-only, its absence
 * here is the real reason it will be absent for the client.
 *
 * Sits beside the questionnaire tabs rather than inside them: the client shell
 * is a whole page with its own header, and framing it in admin chrome would
 * stop it being the thing it is meant to prove.
 *
 * Read-only, and it writes nothing: previewing does not move the intake on.
 */
export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const intake = await getIntake(id);
  if (!intake) notFound();

  const questions = await getIntakeQuestions(id);
  const publicIntake = toPublicIntake({
    clientName: intake.client.name,
    status: intake.status,
    submittedAt: intake.submitted_at,
    questions,
  });

  const base = `/client-questionnaires/admin/${id}`;

  return (
    <ClientShell
      clientName={intake.client.name}
      banner={
        <div className="border-b border-rule bg-neutral-tint px-6 py-3.5 md:px-10">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
            <p className="text-[0.875rem] text-slate">
              Internal preview. Nothing here is saved, and the client sees no
              part of this bar.
            </p>
            <span className="flex gap-4">
              <Link
                href={`${base}/questions`}
                className="label text-teal-ink underline underline-offset-2"
              >
                Back to questions
              </Link>
              <Link
                href={base}
                className="label text-teal-ink underline underline-offset-2"
              >
                Overview
              </Link>
            </span>
          </div>
        </div>
      }
    >
      <ClientIntro introText={intake.intro_text} />
      <div className="mt-10">
        <Questionnaire intake={publicIntake} readOnly />
      </div>
    </ClientShell>
  );
}
