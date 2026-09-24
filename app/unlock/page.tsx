import type { Metadata } from "next";
import { Wordmark } from "@/components/site/Wordmark";
import { unlock } from "./actions";

/**
 * TEMPORARY — the access-key screen for /intakes.
 *
 * See lib/auth/temporary-gate.ts. Delete this route with it; the permanent
 * sign-in at /login is untouched and is what this stands in for.
 *
 * Renders outside the (hub) group, so the rail and the module index do not
 * appear behind a screen asking for a key.
 */
export const metadata: Metadata = {
  title: "Client Intakes",
  robots: { index: false, follow: false },
};

const MESSAGES: Record<string, string> = {
  key: "That key was not right. Check it against the one the Digital Marketing lead gave you.",
  unconfigured:
    "Client Intakes is not configured on this deployment yet. Tell the Digital Marketing lead.",
};

export default async function UnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; locked?: string }>;
}) {
  const params = await searchParams;
  const message = params.error ? MESSAGES[params.error] : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-charcoal px-6 py-16">
      <div className="w-full max-w-md">
        <Wordmark tone="light" height={34} />

        <p className="label mt-10 text-teal">Digital Marketing Hub</p>
        <h1 className="mt-3 text-3xl leading-tight font-semibold tracking-[-0.025em] text-white">
          Client Intakes
        </h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-white/60">
          Client intake records are internal. Enter the access key to continue.
        </p>

        {message && (
          <p className="mt-6 border-l-2 border-teal bg-white/[0.06] px-4 py-3 text-[0.875rem] leading-relaxed text-white/80">
            {message}
          </p>
        )}

        {params.locked && !message && (
          <p className="mt-6 border-l-2 border-white/20 px-4 py-3 text-[0.875rem] leading-relaxed text-white/70">
            Client Intakes is locked on this device.
          </p>
        )}

        <form action={unlock} className="mt-8">
          <input type="hidden" name="next" value={params.next ?? "/intakes"} />

          <label
            htmlFor="key"
            className="label block text-white/50"
          >
            Access key
          </label>
          <input
            id="key"
            name="key"
            type="password"
            required
            autoFocus
            autoComplete="off"
            spellCheck={false}
            className="mt-2 w-full border border-white/20 bg-white/[0.04] px-4 py-3 text-[0.9375rem] text-white outline-none transition-colors placeholder:text-white/25 focus:border-teal"
            placeholder="Paste the key"
          />

          <button
            type="submit"
            className="label mt-5 inline-flex items-center bg-white px-5 py-3.5 text-charcoal transition-colors hover:bg-teal hover:text-ink"
          >
            Unlock Client Intakes
          </button>
        </form>

        <p className="mt-8 text-[0.8125rem] leading-relaxed text-white/40">
          Temporary, while Microsoft sign-in is being set up. The rest of the
          Hub does not need a key, and neither does a questionnaire link we
          have sent a client.
        </p>
      </div>
    </main>
  );
}
