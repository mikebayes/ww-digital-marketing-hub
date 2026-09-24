"use client";

import { usePathname } from "next/navigation";
import { lock } from "@/app/unlock/actions";

/**
 * TEMPORARY — the lock control for Client Intakes.
 *
 * ===========================================================================
 * This sits where the rail footer's "Sign out" used to. That control still
 * exists — SignOutButton, backed by signOut() in app/login/actions.ts — and
 * comes back when Microsoft sign-in does, rendered unconditionally, because
 * then the whole Hub needs a session and the way out belongs on every page.
 *
 * Today the documentation is open and only /intakes is held, so the control
 * appears only where there is something to lock. Offering it on a
 * documentation page would be offering to end a session nobody has.
 *
 * The pathname test is duplicated from isGatedPath() rather than imported:
 * this is a client component, and lib/auth/temporary-gate.ts reads the key
 * from the environment. Importing it here would pull that module into the
 * browser bundle, which is the one thing this gate must never do.
 * See lib/auth/temporary-gate.ts.
 * ===========================================================================
 */
export function AccessControl({ className }: { className?: string }) {
  const pathname = usePathname();
  const gated = pathname === "/intakes" || pathname.startsWith("/intakes/");

  if (!gated) return null;

  return (
    <form action={lock} className={className}>
      <button
        type="submit"
        className="label text-white/50 underline underline-offset-2 transition-colors hover:text-white"
      >
        Lock Client Intakes
      </button>
    </form>
  );
}
