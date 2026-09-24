import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClientIntro, ClientShell } from "@/components/intake/ClientShell";
import { Questionnaire } from "@/components/intake/Questionnaire";
import { getPublicIntake } from "@/lib/intake/public-queries";
import { isOpenForClient } from "@/lib/intake/public";
import { saveProgressAction, submitAction } from "./actions";

export const dynamic = "force-dynamic";

/**
 * The client questionnaire.
 *
 * Renders outside the (hub) route group, so none of the internal navigation,
 * module index or footer exists on this page at all — not hidden, not present.
 *
 * noindex is inherited from the root layout and reinforced by the site-wide
 * X-Robots-Tag header, which matters more here than anywhere else in the Hub.
 */
/**
 * The tab the client sees.
 *
 * `absolute` on purpose: the root layout appends "· Digital Marketing Hub" to
 * every title, which is internal language on a page we send outside the
 * company. This is the one route where the Hub must not be named at all.
 *
 * A bad token gets the generic title, because the 404 should not confirm which
 * client a guessed token belonged to.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const intake = await getPublicIntake(token);

  return {
    title: {
      absolute: intake
        ? `${intake.clientName} | ${intake.title} | Web Wizards`
        : "Web Wizards",
    },
    robots: { index: false, follow: false },
  };
}

export default async function ClientIntakePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { token } = await params;
  const { saved } = await searchParams;

  const intake = await getPublicIntake(token);

  // A bad token, an intake that was never sent, and an intake that does not
  // exist are all the same 404. Nothing distinguishes them to a guesser.
  if (!intake) notFound();

  if (!isOpenForClient(intake.status)) {
    return (
      <ClientShell clientName={intake.clientName}>
        <h1 className="text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-charcoal">
          Thank you
        </h1>
        <span aria-hidden className="mt-7 block h-px w-16 bg-teal" />
        <div className="mt-7 max-w-2xl space-y-4 text-[1.0625rem] leading-relaxed text-slate">
          <p>
            We have your answers. Your Account Manager will be in touch to walk
            through anything that still needs a conversation.
          </p>
          <p>
            Nothing else is needed from you right now. If you realise you left
            something out, reply to the email that brought you this link and we
            will add it.
          </p>
        </div>
      </ClientShell>
    );
  }

  return (
    <ClientShell
      clientName={intake.clientName}
      banner={
        saved ? (
          <p className="border-b border-rule bg-teal-tint px-6 py-3.5 text-center text-[0.9375rem] text-charcoal md:px-10">
            Saved. You can close this and come back to the same link later.
          </p>
        ) : null
      }
    >
      <ClientIntro introText={intake.introText} />

      <div className="mt-10">
        <Questionnaire
          intake={intake}
          token={token}
          saveAction={saveProgressAction}
          submitAction={submitAction}
        />
      </div>
    </ClientShell>
  );
}
