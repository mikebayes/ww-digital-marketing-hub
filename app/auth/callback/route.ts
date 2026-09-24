import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAllowedEmail, safeNext } from "@/lib/auth/access";
import { NEXT_COOKIE } from "@/lib/auth/cookies";
import {
  classifyOAuthError,
  failureTag,
  type SignInFailure,
} from "@/lib/auth/oauth-errors";

/**
 * Where Microsoft sign-in comes back to.
 *
 * Exchanges the OAuth code for a session, then checks the identity belongs to
 * Web Wizards before letting it keep one. The Azure provider is already
 * restricted to our tenant, but a tenant can hold guests, and authenticating
 * is not the same as being staff — so an identity that does not carry a
 * webwizards.ca address is signed out here rather than merely blocked later.
 *
 * Every failure is logged before it is turned into a message. A sign-in that
 * only ever says "please try again" cannot be diagnosed from production, and
 * that is not a hypothetical: it cost a day.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorCode = searchParams.get("error_code");
  const description = searchParams.get("error_description");

  /*
   * Nothing on the query string at all.
   *
   * Supabase puts OAuth errors on the fragment when it fails before it can
   * resolve which flow it is in — a rejected client secret does exactly that —
   * and a fragment never reaches the server. The result is a callback that
   * looks empty and an error that cannot be read anywhere. So bounce it back
   * through the browser once, which is the only thing that can see it.
   */
  if (!code && !error && !searchParams.has("relayed")) {
    return fragmentRelay(origin);
  }

  if (error || !code) {
    const reason = error
      ? classifyOAuthError({ error, errorCode, description })
      : "failed";
    const tag = error ? failureTag({ error, errorCode }) : "empty";

    console.error("[auth/callback] provider returned an error", {
      error,
      error_code: errorCode,
      error_description: description,
      has_code: Boolean(code),
      relayed: searchParams.has("relayed"),
      reason,
    });

    return fail(origin, reason, tag);
  }

  const supabase = await createClient();
  const { data, exchangeError } = await exchange(supabase, code);

  if (exchangeError || !data?.user) {
    console.error("[auth/callback] code exchange failed", {
      message: exchangeError?.message,
      status: exchangeError?.status,
      code: exchangeError?.code,
      name: exchangeError?.name,
      got_user: Boolean(data?.user),
    });

    /*
     * A failed exchange is the application's own leg of the flow — the code
     * was fine enough for Supabase to issue it — so it is usually the PKCE
     * verifier cookie, not the provider.
     */
    return fail(origin, "exchange", exchangeError?.code ?? "exchange");
  }

  if (!isAllowedEmail(data.user.email)) {
    console.error("[auth/callback] identity refused on domain", {
      // The domain, never the address: this line goes to a shared log.
      domain: data.user.email?.split("@")[1] ?? "(none)",
      providers: data.user.app_metadata?.providers,
    });
    await supabase.auth.signOut();
    return fail(origin, "denied", "domain");
  }

  console.info("[auth/callback] signed in", {
    domain: data.user.email?.split("@")[1],
    providers: data.user.app_metadata?.providers,
  });

  const next = safeNext(request.cookies.get(NEXT_COOKIE)?.value);
  const response = NextResponse.redirect(`${origin}${next}`);
  response.cookies.delete(NEXT_COOKIE);
  return response;
}

/* -------------------------------------------------------------------------- */

function fail(origin: string, reason: SignInFailure | "exchange", tag: string) {
  const url = new URL(`${origin}/login`);
  url.searchParams.set("error", reason);
  url.searchParams.set("ref", tag);
  return NextResponse.redirect(url);
}

/** Narrow the Supabase result so the error fields can be logged by name. */
async function exchange(
  supabase: Awaited<ReturnType<typeof createClient>>,
  code: string,
) {
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  return {
    data,
    exchangeError: error as
      | (Error & { status?: number; code?: string })
      | null,
  };
}

/**
 * Hand the fragment back to the server, once.
 *
 * Only the error fields and an auth code are forwarded. Access and refresh
 * tokens are deliberately dropped: putting either on a query string writes it
 * into browser history and into every access log between here and Vercel.
 */
function fragmentRelay(origin: string) {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Signing in</title>
<meta name="robots" content="noindex, nofollow">
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#1A1D1F;color:rgba(255,255,255,.6);font:0.9375rem/1.6 system-ui,sans-serif}</style>
</head><body><p>Signing you in&hellip;</p><script>
(function(){
  var keep = ["error","error_code","error_description","code"];
  var src = new URLSearchParams((location.hash || "").replace(/^#/, ""));
  var out = new URLSearchParams();
  out.set("relayed", "1");
  keep.forEach(function (k) { if (src.has(k)) out.set(k, src.get(k)); });
  location.replace(${JSON.stringify(origin)} + "/auth/callback?" + out.toString());
})();
</script></body></html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
