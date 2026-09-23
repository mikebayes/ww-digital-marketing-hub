/**
 * Short-lived cookie holding the page a user was trying to reach when they
 * were sent to sign in.
 *
 * Named here rather than inline so the writer (the sign-in action) and the
 * reader (the OAuth callback) cannot drift apart.
 */
export const NEXT_COOKIE = "ww-next";
