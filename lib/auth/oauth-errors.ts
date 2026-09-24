/**
 * What a failed Microsoft sign-in actually was.
 *
 * Supabase reports OAuth failures as an `error` code plus a prose
 * `error_description`, and the prose is where the useful part lives. Mapping
 * it to a fixed set of reasons here — rather than showing "please try again"
 * for all of them — is the difference between a colleague retrying a sign-in
 * that can never work and somebody being told what to do about it.
 *
 * Pure, so the mapping can be tested against the strings Supabase really
 * sends rather than inferred from watching a login screen.
 */

export type SignInFailure =
  /** The identity is not a Web Wizards one. */
  | "denied"
  /** Supabase refused to create an account it has not seen before. */
  | "newuser"
  /** The email already belongs to an account the identity cannot be joined to. */
  | "conflict"
  /** Microsoft returned an identity carrying no email address. */
  | "noemail"
  /** Supabase could not complete the exchange with Microsoft. */
  | "provider"
  /** The person backed out at the Microsoft screen. */
  | "cancelled"
  /** This deployment is missing its Supabase configuration. */
  | "unconfigured"
  /** Genuinely unrecognised — the log line is the only way to know. */
  | "failed";

type Reported = {
  error?: string | null;
  errorCode?: string | null;
  description?: string | null;
};

/** Ordered most specific first; the first match wins. */
const RULES: { reason: SignInFailure; test: RegExp }[] = [
  { reason: "newuser", test: /signup.?disabled|signups?\s+not\s+allowed/ },
  {
    reason: "conflict",
    test: /identity_already_exists|email_exists|unverified\s+email|already\s+(exists|registered|been\s+registered)/,
  },
  {
    reason: "noemail",
    test: /getting\s+user\s+email|email.*not\s+(provided|found|present)|no\s+email/,
  },
  {
    reason: "cancelled",
    test: /access_denied|cancell?ed|denied\s+by\s+(the\s+)?user|aadsts65004|consent_required/,
  },
  {
    reason: "provider",
    test: /unable\s+to\s+exchange|external\s+code|bad_oauth_state|invalid_client|unauthorized_client|provider.*(disabled|not\s+enabled)|unsupported\s+provider|aadsts7000\d{2}|invalid.?client.?secret/,
  },
];

export function classifyOAuthError(reported: Reported): SignInFailure {
  const haystack = [reported.errorCode, reported.error, reported.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!haystack) return "failed";

  for (const rule of RULES) {
    if (rule.test.test(haystack)) return rule.reason;
  }

  /*
   * "server_error" on its own carries no information beyond "Supabase threw".
   * In practice that is the provider leg — a rejected client secret arrives
   * this way — so it is worth more than "try again", but only as a last
   * resort, after the specific rules above have had their turn.
   */
  if (/server_error|unexpected_failure/.test(haystack)) return "provider";

  return "failed";
}

/**
 * A short, safe tag for the login screen.
 *
 * Long enough to tell two failures apart when someone reports one, short
 * enough to read down a phone. Never carries the description itself, which can
 * repeat an email address back onto a shared screen.
 */
export function failureTag(reported: Reported): string {
  const raw = (reported.errorCode || reported.error || "none")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 24);
  return raw || "none";
}
