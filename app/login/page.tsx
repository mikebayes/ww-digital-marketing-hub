import type { Metadata } from "next";
import { Wordmark } from "@/components/site/Wordmark";
import { safeNext } from "@/lib/auth/access";
import { signInWithMicrosoft } from "./actions";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

/**
 * Staff sign-in.
 *
 * Microsoft only. There is no password to store, no invite list to maintain,
 * and no email to wait for — access follows the Web Wizards Entra tenant, so
 * somebody who leaves loses the Hub at the same moment they lose everything
 * else.
 *
 * Renders outside the (hub) group, so someone who is not signed in never sees
 * the internal navigation.
 */
const MESSAGES: Record<string, string> = {
  denied:
    "That account is not a Web Wizards account. The Hub is internal, so sign in with your Web Wizards Microsoft account.",
  failed: "That sign-in did not complete. Please try again.",
  newuser:
    "Your Web Wizards account has not been given Hub access yet. Ask the Digital Marketing lead to enable it — you will not need to do anything else.",
  provider:
    "Microsoft sign-in is unavailable right now. If it keeps happening, tell the Digital Marketing lead.",
  unconfigured:
    "This deployment is not configured for sign-in yet. Tell the Digital Marketing lead.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; signedout?: string }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const message = params.error ? MESSAGES[params.error] : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-charcoal px-6 py-16">
      <div className="w-full max-w-md">
        <Wordmark tone="light" height={34} />

        <h1 className="mt-10 text-3xl leading-tight font-semibold tracking-[-0.025em] text-white">
          Digital Marketing Hub
        </h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-white/60">
          The Hub is internal to Web Wizards. Sign in with your Web Wizards
          Microsoft account to continue.
        </p>

        {message && (
          <p className="mt-6 border-l-2 border-teal bg-white/[0.06] px-4 py-3 text-[0.875rem] leading-relaxed text-white/80">
            {message}
          </p>
        )}

        {params.signedout && !message && (
          <p className="mt-6 border-l-2 border-white/20 px-4 py-3 text-[0.875rem] leading-relaxed text-white/70">
            You are signed out.
          </p>
        )}

        <form action={signInWithMicrosoft} className="mt-8">
          <input type="hidden" name="next" value={next} />
          <button
            type="submit"
            className="label inline-flex items-center gap-3 bg-white px-5 py-3.5 text-charcoal transition-colors hover:bg-teal hover:text-ink"
          >
            <MicrosoftMark />
            Sign in with Microsoft
          </button>
        </form>

        <p className="mt-8 text-[0.8125rem] leading-relaxed text-white/40">
          Looking for a questionnaire we sent you? Use the link in that email —
          it does not need a sign-in.
        </p>
      </div>
    </main>
  );
}

/** The Microsoft four-square, drawn rather than fetched. */
function MicrosoftMark() {
  return (
    <svg aria-hidden width="14" height="14" viewBox="0 0 16 16">
      <rect x="0" y="0" width="7" height="7" fill="#F25022" />
      <rect x="9" y="0" width="7" height="7" fill="#7FBA00" />
      <rect x="0" y="9" width="7" height="7" fill="#00A4EF" />
      <rect x="9" y="9" width="7" height="7" fill="#FFB900" />
    </svg>
  );
}
