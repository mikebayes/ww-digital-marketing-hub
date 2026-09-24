import type { ReactNode } from "react";
import { Wordmark } from "@/components/site/Wordmark";

/**
 * The client-facing wrapper.
 *
 * Deliberately not the Hub shell. There is no rail, no module index, no footer
 * linking into internal standards, and nothing naming a client other than the
 * one reading it. Branding, the questionnaire, and nothing else.
 */
export function ClientShell({
  clientName,
  children,
  banner,
}: {
  clientName: string;
  children: ReactNode;
  banner?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-charcoal px-6 py-7 md:px-10">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-6">
          <Wordmark tone="light" height={30} />
          {clientName && (
            <p className="label text-right text-white/45">{clientName}</p>
          )}
        </div>
      </header>

      {banner}

      <main className="mx-auto max-w-3xl px-6 py-12 md:px-10 md:py-16">
        {children}
      </main>

      <footer className="border-t border-rule px-6 py-8 md:px-10">
        <p className="mx-auto max-w-3xl text-[0.875rem] text-muted">
          Web Wizards · If anything here is unclear, reply to the email that
          brought you this link.
        </p>
      </footer>
    </div>
  );
}

/**
 * The introduction, in the words agreed for it.
 *
 * `introText` replaces the opening paragraphs when a questionnaire sets one in
 * Settings — some engagements need to say who we are or why we are asking. The
 * two lines that follow it are not replaceable: "answer what you can" is the
 * instruction that makes the whole thing work, and the line about credentials
 * is a rule, not copy.
 */
export function ClientIntro({ introText }: { introText?: string | null }) {
  const custom = introText?.trim();

  return (
    <div className="border-b border-rule pb-10">
      <h1 className="text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-balance text-charcoal">
        Help us get ready
      </h1>

      <span aria-hidden className="mt-7 block h-px w-16 bg-teal" />

      <div className="mt-7 max-w-2xl space-y-4 text-[1.0625rem] leading-relaxed text-slate">
        {custom ? (
          custom
            .split(/\n\s*\n/)
            .map((paragraph, index) => <p key={index}>{paragraph}</p>)
        ) : (
          <p>
            We&rsquo;ve already filled in anything we know from our previous
            conversations and research. Please review what&rsquo;s here and fill
            in anything that&rsquo;s missing.
          </p>
        )}
        <p>
          Answer what you can. If you&rsquo;re unsure about something, leave it
          blank and we can discuss it during kickoff.
        </p>
        <p className="font-medium text-charcoal">
          Please do not include passwords or authentication codes.
        </p>
      </div>
    </div>
  );
}
