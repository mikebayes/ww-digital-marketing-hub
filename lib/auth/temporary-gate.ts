/**
 * TEMPORARY — shared access key for /intakes.
 *
 * ===========================================================================
 * Microsoft sign-in is dormant — see lib/auth/microsoft-gate.ts — so the Hub
 * is open. The documentation can be, but /intakes cannot: with no session to
 * be the `authenticated` role for, the intake admin queries as the service
 * role, which means RLS is not underneath it any more. Open plus service role
 * is client data on the public internet, so this key stands in front of it.
 *
 * The documentation routes and /intake/<token> stay open. This is the
 * smallest thing that closes the one hole that matters.
 *
 * TO REMOVE, once Microsoft sign-in works:
 *   1. follow the reactivation steps in lib/auth/microsoft-gate.ts, which
 *      replace proxy.ts with the real gate and put lib/intake/queries.ts back
 *      on the session client
 *   2. delete this file, app/unlock/, components/site/AccessControl.tsx and
 *      tests/temporary-gate.test.ts
 *   3. delete INTAKES_ACCESS_KEY from Vercel
 *
 * What this is not: one shared key identifies nobody, cannot be revoked for
 * one person, and can be passed on by anyone who has it. It says "someone at
 * Web Wizards", never "who". Fine for a few days, not fine as the model —
 * which is why the Microsoft code it stands in for is still in the tree.
 * ===========================================================================
 */

export const ACCESS_COOKIE = "ww-intakes-access";
export const UNLOCK_PATH = "/unlock";

/** The Vercel variable holding the key. Server-side only, never NEXT_PUBLIC_. */
export const ACCESS_KEY_ENV = "INTAKES_ACCESS_KEY";

/** A working day, so nobody re-enters the key between intakes. */
export const ACCESS_MAX_AGE = 60 * 60 * 12;

/**
 * Read the key.
 *
 * Written as a static `process.env.X` on purpose. The proxy runs in the Edge
 * runtime, where the build inlines statically-referenced variables; a dynamic
 * `process.env[name]` would come back undefined there and fail the gate open
 * or closed depending on nothing useful.
 */
export function accessKey(): string | undefined {
  return process.env.INTAKES_ACCESS_KEY || undefined;
}

/** Whether this deployment has a key at all. */
export function isGateConfigured(): boolean {
  return Boolean(accessKey());
}

/**
 * Routes behind the key: the staff admin, and nothing else.
 *
 * Two prefixes, because the module moved. /client-questionnaires/admin is
 * where it lives; /intakes is where it was, and those URLs still redirect, so
 * they stay gated — an ungated redirect into a gated route is only ever one
 * missed edge case away from being an ungated route.
 *
 * Deliberately absent:
 *
 *   /client-questionnaires   the section index, which is documentation
 *   /intake/<token>          the client questionnaire
 *
 * The trailing slashes matter twice over. "/intakes" starts with "/intake",
 * so matching the shorter prefix would put a staff key in front of the
 * client's questionnaire; and "/client-questionnaires/admin" without the
 * boundary would be matched by a future "/client-questionnaires/administration
 * -guide" documentation page, quietly gating a page meant to be read.
 */
export function isGatedPath(pathname: string): boolean {
  return GATED.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

const GATED = ["/client-questionnaires/admin", "/intakes"];

/**
 * What goes in the cookie: a digest of the key, never the key itself.
 *
 * Web Crypto rather than node:crypto because this runs in the proxy, where
 * node:crypto does not exist.
 */
export async function accessToken(key: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${ACCESS_COOKIE}:${key}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Comparison that does not leak how much of the value was right. */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Whether a supplied key matches the configured one. */
export async function isValidKey(supplied: string): Promise<boolean> {
  const key = accessKey();
  if (!key || !supplied) return false;
  return constantTimeEqual(await accessToken(supplied), await accessToken(key));
}

/** Whether a cookie value presented by the browser is the current token. */
export async function isValidToken(
  presented: string | undefined,
): Promise<boolean> {
  const key = accessKey();
  if (!key || !presented) return false;
  return constantTimeEqual(presented, await accessToken(key));
}
