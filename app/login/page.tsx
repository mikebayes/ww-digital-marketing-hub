import type { Metadata } from "next";
import { Wordmark } from "@/components/site/Wordmark";
import { sendMagicLink } from "./actions";
import { inputClass, PrimaryAction } from "@/components/intake/ui";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

/**
 * Staff sign-in.
 *
 * Magic link only. There is no password to store, reset or leak, and no user
 * management screen to build — access is granted by being in the Supabase
 * project's user list, which is where it already has to be managed anyway.
 *
 * Renders outside the (hub) group, so someone who is not signed in never sees
 * the internal navigation.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; sent?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-charcoal px-6 py-16">
      <div className="w-full max-w-md">
        <Wordmark tone="light" height={34} />

        <h1 className="mt-10 text-3xl leading-tight font-semibold tracking-[-0.025em] text-white">
          Digital Marketing Hub
        </h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-white/60">
          Client Intakes hold client information, so this part of the Hub needs
          a sign-in. Enter your Web Wizards email and we will send you a link.
        </p>

        {params.error === "unconfigured" && (
          <p className="mt-6 border border-white/20 px-4 py-3 text-[0.875rem] leading-relaxed text-white/70">
            Supabase is not configured for this deployment yet, so sign-in is
            unavailable. See README.md.
          </p>
        )}

        {params.sent ? (
          <p className="mt-8 border-t-2 border-teal pt-6 text-[0.9375rem] leading-relaxed text-white/80">
            Check your email. The link signs you in on this device and expires
            shortly.
          </p>
        ) : (
          <form action={sendMagicLink} className="mt-8">
            <input type="hidden" name="next" value={params.next ?? "/intakes"} />
            <label htmlFor="email" className="label block text-white/50">
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@webwizards.ca"
              className={`${inputClass} mt-3 border-white/25 bg-white/[0.06] text-white placeholder:text-white/35`}
            />
            <div className="mt-6">
              <PrimaryAction>Send the link</PrimaryAction>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
