import { randomBytes } from "node:crypto";

/**
 * The client link is the only thing standing between a stranger and a client's
 * onboarding answers, so it is sized like a credential rather than like an id:
 * 32 bytes of CSPRNG output, base64url encoded, 43 characters.
 *
 * Deliberately not a UUID. A v4 UUID carries 122 bits and looks like a database
 * key, which invites people to treat it as one; this looks like a secret
 * because it is one.
 */
const TOKEN_BYTES = 32;

export function generatePublicToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

/**
 * Cheap shape check before hitting the database, so an obviously wrong token
 * costs a 404 rather than a query.
 */
export function isPlausibleToken(token: string): boolean {
  return /^[A-Za-z0-9_-]{32,64}$/.test(token);
}

/** The absolute URL to hand a client. */
export function clientIntakeUrl(origin: string, token: string): string {
  return `${origin.replace(/\/+$/, "")}/intake/${token}`;
}

/**
 * Work out the origin to build a client link from.
 *
 * A plain navigation sends no Origin header, so the scheme has to be derived.
 * Assuming https produced an https://localhost link in development, which is
 * not openable — the Account Manager copies a dead URL and only finds out when
 * the client says so.
 */
export function resolveOrigin(
  host: string | null,
  forwardedProto: string | null,
): string {
  const resolvedHost = host || "localhost:3000";
  const local = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(resolvedHost);
  // A proxy that terminates TLS knows better than we do; Vercel sets this.
  const scheme = forwardedProto?.split(",")[0].trim() || (local ? "http" : "https");
  return `${scheme}://${resolvedHost}`;
}
