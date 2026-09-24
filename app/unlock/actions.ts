"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  UNLOCK_PATH,
  accessKey,
  accessToken,
  isGatedPath,
  isValidKey,
} from "@/lib/auth/temporary-gate";

/**
 * TEMPORARY — see lib/auth/temporary-gate.ts. Delete with it.
 */

/** Where to send someone after they unlock. Only gated paths, never elsewhere. */
function destination(raw: unknown): string {
  const next = String(raw ?? "");
  if (!next.startsWith("/") || next.startsWith("//")) return "/intakes";
  return isGatedPath(next.split("?")[0]) ? next : "/intakes";
}

export async function unlock(formData: FormData) {
  const next = destination(formData.get("next"));
  const supplied = String(formData.get("key") ?? "").trim();

  if (!accessKey()) {
    redirect(`${UNLOCK_PATH}?error=unconfigured`);
  }

  if (!(await isValidKey(supplied))) {
    /*
     * One shared key is guessable in a way a password behind a per-account
     * lockout is not, and a serverless attempt counter would reset with the
     * instance. A fixed delay is what is available: it caps how fast a single
     * caller can try, and is the reason the key itself should be long and
     * random rather than memorable.
     */
    await new Promise((resolve) => setTimeout(resolve, 600));
    const again = new URLSearchParams({ error: "key", next });
    redirect(`${UNLOCK_PATH}?${again}`);
  }

  const requestHeaders = await headers();
  const proto =
    requestHeaders.get("x-forwarded-proto")?.split(",")[0].trim() ?? "https";

  const store = await cookies();
  store.set(ACCESS_COOKIE, await accessToken(accessKey()!), {
    httpOnly: true,
    sameSite: "lax",
    secure: proto === "https",
    path: "/",
    maxAge: ACCESS_MAX_AGE,
  });

  redirect(next);
}

export async function lock() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  redirect(`${UNLOCK_PATH}?locked=1`);
}
