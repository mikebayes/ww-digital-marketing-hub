import "server-only";
import { supabaseServiceRoleKey } from "@/lib/supabase/env";

/**
 * Who is answering, on the client side of the questionnaire.
 *
 * Deliberately lightweight. The security model is the questionnaire URL — 32
 * bytes of CSPRNG — plus knowing an email address we were given. That is
 * enough for an onboarding questionnaire and it is not a login: there is no
 * password, no code to wait for, and no account afterwards.
 *
 * The cookie is signed rather than stored, so there is no session table to
 * expire or clean up. It carries the intake and the contact, and both are
 * re-checked against the database on every use — so removing a contact in the
 * admin takes effect immediately, even for a browser that already has one.
 */

const VERSION = "v1";

/** A working fortnight. Long enough to come back to, short enough to lapse. */
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

export const SESSION_COOKIE = "ww-questionnaire";

export interface ClientSession {
  intakeId: string;
  contactId: string;
}

/**
 * The signing key.
 *
 * Derived from the service role key rather than a new secret to configure:
 * that key is already required for the questionnaire to function at all, is
 * server-only, and rotating it invalidating outstanding sessions is correct
 * behaviour rather than a surprise.
 */
async function signingKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(`intake-session:${supabaseServiceRoleKey()}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function sign(payload: string): Promise<string> {
  const signature = await crypto.subtle.sign(
    "HMAC",
    await signingKey(),
    new TextEncoder().encode(payload),
  );
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Mint a cookie value for a contact who has just identified themselves. */
export async function issueSession(session: ClientSession): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const payload = `${VERSION}.${session.intakeId}.${session.contactId}.${expires}`;
  return `${payload}.${await sign(payload)}`;
}

/**
 * Read a cookie value back, or null.
 *
 * Returns the claim only. Whether that contact still belongs to that intake is
 * a database question, answered by the caller — a signature proves the cookie
 * was minted here, not that it is still valid.
 */
export async function readSession(
  raw: string | undefined,
): Promise<ClientSession | null> {
  if (!raw) return null;

  const parts = raw.split(".");
  if (parts.length !== 5) return null;

  const [version, intakeId, contactId, expires, signature] = parts;
  if (version !== VERSION) return null;

  const expiresAt = Number(expires);
  if (!Number.isFinite(expiresAt) || expiresAt * 1000 < Date.now()) return null;

  const expected = await sign(
    `${version}.${intakeId}.${contactId}.${expires}`,
  );
  if (!constantTimeEqual(signature, expected)) return null;

  return { intakeId, contactId };
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
} as const;

/**
 * Compare a typed email against a stored one.
 *
 * Trimmed and case-folded, because someone reading their address off a
 * business card types it how they type it. Nothing cleverer: normalising
 * further — stripping dots, ignoring plus-addressing — would start letting in
 * addresses nobody approved.
 */
export function emailMatches(typed: string, approved: string): boolean {
  return typed.trim().toLowerCase() === approved.trim().toLowerCase();
}
