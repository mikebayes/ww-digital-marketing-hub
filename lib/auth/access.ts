/**
 * Who may see the Hub, and which routes are exempt.
 *
 * The posture is deny by default. Everything in this application is internal
 * Web Wizards material unless it appears in PUBLIC below, so a route added
 * later is protected because nobody remembered to protect it, rather than
 * exposed because nobody remembered to list it.
 *
 * Pure functions with no framework imports, so the rules can be tested
 * directly rather than inferred from middleware behaviour.
 */

/** Staff sign in with Microsoft against the Web Wizards Entra tenant. */
export const ALLOWED_EMAIL_DOMAIN = "webwizards.ca";

/**
 * Routes reachable without a Microsoft session.
 *
 * `exact` matches the path itself; `prefix` matches the path and anything
 * beneath it. The distinction matters: the client questionnaire lives under
 * /intake/ and the staff admin lives at /intakes, so a loose prefix on
 * "/intake" would quietly publish the admin.
 */
const PUBLIC: { exact?: string[]; prefix?: string[] } = {
  exact: ["/login", "/robots.txt"],
  prefix: [
    // Supabase OAuth returns here. Unreachable without a valid code.
    "/auth/",
    // The client questionnaire. Its token is its credential.
    "/intake/",
  ],
};

/** Static files the application needs before anyone has signed in. */
const STATIC_PREFIXES = ["/_next/", "/brand/", "/templates/", "/productive/"];
const STATIC_FILE = /\.[a-z0-9]+$/i;

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC.exact?.includes(pathname)) return true;
  if (PUBLIC.prefix?.some((prefix) => pathname.startsWith(prefix))) return true;
  if (STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true;

  /*
   * A path ending in a file extension is an asset, not a page. Checked last so
   * that a real route never reaches it — none of the Hub's routes end in a
   * dot-suffix.
   */
  return STATIC_FILE.test(pathname);
}

/**
 * Whether a signed-in identity belongs to Web Wizards.
 *
 * The Azure provider is already restricted to our tenant, but a tenant can
 * hold guest identities, and a guest authenticating successfully is not the
 * same as a guest being staff. Checked again here so the application does not
 * inherit its access rules from a setting in someone else's dashboard.
 */
export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const at = email.lastIndexOf("@");
  if (at < 0) return false;
  return email.slice(at + 1).trim().toLowerCase() === ALLOWED_EMAIL_DOMAIN;
}

/**
 * Sanitise a post-login destination.
 *
 * Only same-origin paths are returned, so a crafted `next` cannot turn the
 * login page into an open redirect. A protocol-relative "//evil.com" is a URL,
 * not a path, which is why the second character is checked too.
 */
export function safeNext(next: string | null | undefined, fallback = "/"): string {
  if (!next) return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//")) return fallback;
  if (next.startsWith("/login")) return fallback;
  return next;
}

/**
 * Where an OAuth return that landed on the wrong page should be sent.
 *
 * Supabase validates the redirect it was asked for against the project's own
 * allow list and silently substitutes the Site URL when a URL is not on it.
 * The Site URL is the Hub's root, so a sign-in can come back to "/" carrying
 * the authorization code rather than to /auth/callback. The root is a
 * protected route, so without this the code would be thrown away and the user
 * bounced to /login — a sign-in loop with no error to explain it.
 *
 * This forwards the credential to the route that can spend it. It becomes
 * inert the moment /auth/callback is added to the Supabase redirect allow
 * list, and can be deleted once that is confirmed in every environment.
 *
 * Deliberately narrow: the root only, and only when OAuth parameters are
 * present. An ordinary visit to the homepage is untouched.
 */
export function oauthLandingTarget(
  pathname: string,
  params: URLSearchParams,
): string | null {
  if (pathname !== "/") return null;
  if (!params.has("code") && !params.has("error")) return null;

  const forwarded = new URLSearchParams();
  for (const key of ["code", "error", "error_description"]) {
    const value = params.get(key);
    if (value !== null) forwarded.set(key, value);
  }
  return `/auth/callback?${forwarded.toString()}`;
}
