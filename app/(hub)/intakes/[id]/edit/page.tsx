import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader, SectionLabel } from "@/components/hub/primitives";
import { AnswerInput } from "@/components/intake/AnswerInput";
import { PrimaryAction, SecondaryAction } from "@/components/intake/ui";
import { getIntake, getIntakeQuestions } from "@/lib/intake/queries";
import type { IntakeQuestion } from "@/lib/intake/types";
import { saveIntakeQuestionsAction } from "../../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Prepare questionnaire" };

const REQUIRED_LABEL: Record<IntakeQuestion["required_mode"], string> = {
  required: "Required",
  optional: "Optional",
  required_by_completion: "Needed before we finish",
};

/**
 * Preparing the questionnaire.
 *
 * The brief for this screen was that it should not look like a database admin
 * page, so it is laid out as the document it produces: grouped the way the
 * questions are grouped, showing the exact wording the client will read, with
 * the controls sitting quietly beside each question rather than as a row of
 * columns to fill in.
 */
export default async function EditIntakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const intake = await getIntake(id);
  if (!intake) notFound();

  const questions = await getIntakeQuestions(id);
  const serviceName = new Map(intake.services.map((s) => [s.id, s.name]));

  // Grouped by service then section, which is how the Account Manager thinks
  // about them — "the social questions", not "questions 14 to 31".
  const groups = new Map<string, Map<string, IntakeQuestion[]>>();
  for (const question of questions) {
    const service = serviceName.get(question.service_id) ?? "Other";
    let sections = groups.get(service);
    if (!sections) {
      sections = new Map();
      groups.set(service, sections);
    }
    const list = sections.get(question.section) ?? [];
    list.push(question);
    sections.set(question.section, list);
  }

  return (
    <div className="px-6 pt-10 pb-4 md:px-12 lg:px-16 lg:pt-14">
      <PageHeader
        title="Prepare the questionnaire"
        lede={`Review what ${intake.client.name} will be asked. Turn off anything that does not apply, and fill in what we already know so they are not asked for it twice.`}
        breadcrumb={[
          { label: "Hub", href: "/" },
          { label: "Intakes", href: "/intakes" },
          { label: intake.client.name, href: `/intakes/${id}` },
          { label: "Prepare" },
        ]}
      />

      <form action={saveIntakeQuestionsAction} className="@container mt-12">
        <input type="hidden" name="intake_id" value={id} />

        <div className="space-y-14">
          {[...groups.entries()].map(([service, sections]) => (
            <section key={service}>
              <h2 className="border-b-2 border-charcoal pb-3 text-xl leading-tight font-semibold tracking-[-0.02em] text-charcoal">
                {service}
              </h2>

              <div className="mt-8 space-y-10">
                {[...sections.entries()].map(([section, items]) => (
                  <div key={section}>
                    <SectionLabel tone="muted">{section}</SectionLabel>

                    <ul className="mt-4 border-t border-rule">
                      {items.map((question) => (
                        <li key={question.id} className="border-b border-rule py-6">
                          <div className="grid gap-6 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
                            <div className="min-w-0">
                              <label className="flex cursor-pointer items-baseline gap-3">
                                <input
                                  type="checkbox"
                                  name={`included:${question.id}`}
                                  defaultChecked={question.included}
                                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-teal-ink)]"
                                />
                                <span className="text-[0.9375rem] leading-snug font-medium text-charcoal">
                                  {question.question_text}
                                </span>
                              </label>

                              {question.help_text && (
                                <p className="mt-2 pl-7 text-[0.875rem] leading-relaxed text-slate">
                                  {question.help_text}
                                </p>
                              )}

                              <p className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 pl-7">
                                <span className="label text-muted">
                                  {REQUIRED_LABEL[question.required_mode]}
                                </span>
                                <span className="label text-muted">
                                  {question.client_visible ? "Client sees this" : "Internal only"}
                                </span>
                                {question.client_visible && !question.client_editable && (
                                  <span className="label text-muted">Read only for client</span>
                                )}
                              </p>
                            </div>

                            <div className="min-w-0">
                              <p className="label text-muted">
                                {question.client_visible ? "Pre-fill" : "Internal note"}
                              </p>
                              <div className="mt-2.5">
                                <AnswerInput
                                  name={`prefill:${question.id}`}
                                  fieldType={question.field_type}
                                  options={question.options ?? []}
                                  value={question.prefill_answer}
                                />
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="sticky bottom-0 mt-12 flex flex-wrap items-center gap-4 border-t border-rule bg-paper py-6">
          <PrimaryAction>Save</PrimaryAction>
          <SecondaryAction href={`/intakes/${id}/preview`}>Preview</SecondaryAction>
          <SecondaryAction href={`/intakes/${id}`}>Back to intake</SecondaryAction>
        </div>
      </form>
    </div>
  );
}
