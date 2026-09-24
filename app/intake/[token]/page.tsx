import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClientIntro, ClientShell } from "@/components/intake/ClientShell";
import { Questionnaire } from "@/components/intake/Questionnaire";
import { getPublicIntake } from "@/lib/intake/public-queries";
import { isOpenForClient } from "@/lib/intake/public";
import { cookies } from "next/headers";
import { inputClass } from "@/components/intake/ui";
import { SESSION_COOKIE, readSession } from "@/lib/intake/client-session";
import { resolveSessionContact } from "@/lib/intake/public-queries";
import {
  enterAction,
  finishForNowAction,
  saveProgressAction,
  switchContactAction,
} from "./actions";

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
  searchParams: Promise<{ saved?: string; denied?: string }>;
}) {
  const { token } = await params;
  const { saved, denied } = await searchParams;

  const intake = await getPublicIntake(token);

  // A bad token, a questionnaire that is not live, and one that does not exist
  // are all the same 404. Nothing distinguishes them to a guesser.
  if (!intake) notFound();

  const store = await cookies();
  const active = await resolveSessionContact(
    token,
    await readSession(store.get(SESSION_COOKIE)?.value),
  );

  /*
   * The email gate. Server-side and before anything else: the questionnaire is
   * not rendered and then hidden, it is not rendered at all.
   */
  if (!active) {
    return (
      <ClientShell clientName={intake.clientName}>
        <h1 className="text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-charcoal">
          Before you start
        </h1>

        <span aria-hidden className="mt-7 block h-px w-16 bg-teal" />

        <div className="mt-7 max-w-2xl space-y-4 text-[1.0625rem] leading-relaxed text-slate">
          <p>
            Enter your email address to continue. This questionnaire is shared
            with your colleagues, so we use it to record who answered what.
          </p>
        </div>

        {denied && (
          <p className="mt-6 max-w-2xl border-l-2 border-charcoal bg-surface px-5 py-4 text-[0.9375rem] leading-relaxed text-charcoal">
            We could not match that address. Please use the address the
            questionnaire was sent to, or reply to that email and we will add
            you.
          </p>
        )}

        <form action={enterAction} className="mt-8 max-w-md">
          <input type="hidden" name="token" value={token} />
          <label
            htmlFor="email"
            className="block text-[0.9375rem] font-semibold text-charcoal"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoFocus
            autoComplete="email"
            className={`${inputClass} mt-3`}
          />
          <button
            type="submit"
            className="label mt-5 inline-flex items-center gap-3 bg-charcoal px-5 py-3.5 text-white transition-colors hover:bg-teal-ink"
          >
            Continue
            <span aria-hidden className="h-px w-6 bg-teal" />
          </button>
        </form>

        <p className="mt-8 max-w-2xl text-[0.875rem] leading-relaxed text-muted">
          No password and no sign-up. We will not email you anything from here.
        </p>
      </ClientShell>
    );
  }

  const open = isOpenForClient(intake.status);
  const hasFinished = active.contact.participation === "finished";

  return (
    <ClientShell
      clientName={intake.clientName}
      banner={
        <div className="border-b border-rule bg-neutral-tint px-6 py-3 md:px-10">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <p className="text-[0.875rem] text-slate">
              Answering as{" "}
              <strong className="font-semibold text-charcoal">
                {active.contact.name}
              </strong>
            </p>
            <form action={switchContactAction}>
              <input type="hidden" name="token" value={token} />
              <button
                type="submit"
                className="label text-teal-ink underline underline-offset-2"
              >
                Use another email
              </button>
            </form>
          </div>
        </div>
      }
    >
      {/*
       * Derived from the contact's own state rather than a query flag, so it
       * survives a refresh and is still there when they come back tomorrow —
       * "have I done this already?" is the question someone returning to a
       * shared questionnaire actually has.
       */}
      {hasFinished && (
        <p className="mb-8 border-l-2 border-teal bg-teal-tint px-5 py-4 text-[0.9375rem] leading-relaxed text-charcoal">
          Thanks. Your responses have been saved. You can return to this
          questionnaire using the same link if you need to make changes while it
          remains open.
        </p>
      )}

      {saved && !hasFinished && (
        <p className="mb-8 border-l-2 border-teal bg-teal-tint px-5 py-4 text-[0.9375rem] text-charcoal">
          Saved. You can close this and come back to the same link later.
        </p>
      )}

      {!open && (
        <p className="mb-8 border-l-2 border-charcoal bg-surface px-5 py-4 text-[0.9375rem] leading-relaxed text-charcoal">
          This questionnaire has been closed by Web Wizards, so it is now
          read-only. If something needs changing, reply to the email that
          brought you this link.
        </p>
      )}

      <ClientIntro introText={intake.introText} />

      <div className="mt-10">
        <Questionnaire
          intake={intake}
          token={token}
          readOnly={!open}
          saveAction={open ? saveProgressAction : undefined}
          finishAction={open ? finishForNowAction : undefined}
        />
      </div>
    </ClientShell>
  );
}
