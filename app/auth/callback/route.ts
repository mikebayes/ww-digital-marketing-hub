import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAllowedEmail, safeNext } from "@/lib/auth/access";
import { NEXT_COOKIE } from "@/lib/auth/cookies";

/**
 * Where Microsoft sign-in comes back to.
 *
 * Exchanges the OAuth code for a session, then checks the identity belongs to
 * Web Wizards before letting it keep one. The Azure provider is already
 * restricted to our tenant, but a tenant can hold guests, and authenticating
 * is not the same as being staff — so an identity that does not carry a
 * webwizards.ca address is signed out here rather than merely blocked later.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  /*
   * Supabase reports a refused or cancelled sign-in on the query string. Treat
   * it as a plain failure: the user does not need the provider's wording.
   */
  if (searchParams.has("error") || !code) {
    /*
     * A project with sign-ups disabled refuses an identity it has not seen
     * before, which is what a new colleague's first sign-in looks like. That
     * is an administrative state, not a failed password, so it gets its own
     * message rather than "try again" — which would never work.
     */
    const description = (
      searchParams.get("error_description") ??
      searchParams.get("error") ??
      ""
    ).toLowerCase();
    const reason = /signup|sign.?up|not allowed/.test(description)
      ? "newuser"
      : "failed";
    return NextResponse.redirect(`${origin}/login?error=${reason}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data?.user) {
    return NextResponse.redirect(`${origin}/login?error=failed`);
  }

  if (!isAllowedEmail(data.user.email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=denied`);
  }

  const next = safeNext(request.cookies.get(NEXT_COOKIE)?.value);
  const response = NextResponse.redirect(`${origin}${next}`);
  response.cookies.delete(NEXT_COOKIE);
  return response;
}
