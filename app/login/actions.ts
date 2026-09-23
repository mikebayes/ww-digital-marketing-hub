"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth/access";
import { NEXT_COOKIE } from "@/lib/auth/cookies";

/**
 * Start Microsoft sign-in.
 *
 * Supabase owns the OAuth exchange; this only asks it for the authorize URL
 * and sends the browser there. There is no second authentication system here
 * and there should not be one.
 */
export async function signInWithMicrosoft(formData: FormData) {
  const next = safeNext(String(formData.get("next") ?? ""));
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const proto =
    requestHeaders.get("x-forwarded-proto")?.split(",")[0].trim() ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");
  const origin = `${proto}://${host}`;

  /*
   * Where to return to is remembered in a cookie rather than carried on the
   * OAuth redirect. Supabase validates redirect_to against its own allow list
   * and silently falls back to the project Site URL when a URL is not on it,
   * which would take the query string with it. A cookie survives that.
   */
  const cookieStore = await cookies();
  cookieStore.set(NEXT_COOKIE, next, {
    httpOnly: true,
    sameSite: "lax",
    secure: proto === "https",
    path: "/",
    maxAge: 600,
  });

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "azure",
    options: {
      // Entra needs email explicitly; without it the identity can arrive with
      // no address and the domain check below has nothing to test.
      scopes: "email",
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data?.url) redirect("/login?error=provider");

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?signedout=1");
}
