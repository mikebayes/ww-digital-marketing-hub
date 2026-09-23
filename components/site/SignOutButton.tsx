import { signOut } from "@/app/login/actions";

/**
 * Sign out, in the rail footer and the mobile drawer.
 *
 * A form rather than a link, because signing out is a state change and should
 * not be something a prefetcher or a crawler can trigger.
 */
export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="label text-white/50 underline underline-offset-2 transition-colors hover:text-white"
      >
        Sign out
      </button>
    </form>
  );
}
