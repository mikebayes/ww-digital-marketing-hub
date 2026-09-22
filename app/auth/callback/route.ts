import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Magic-link landing. Establishes the session cookie, then sends the user
 * where they were originally going.
 *
 * Two link shapes reach here, and both have to work:
 *
 *   ?code=...                      a link created by signInWithOtp from this
 *                                  app, which registers a PKCE challenge, so
 *                                  Supabase returns an exchangeable code.
 *   ?token_hash=...&type=magiclink the shape Supabase's own email templates
 *                                  and admin-generated links produce, where no
 *                                  PKCE challenge exists to exchange against.
 *
 * Handling only the first made sign-in depend on the email template never
 * being changed, which is not a dependency worth having.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/intakes";

  const supabase = await createClient();
  let signedIn = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    signedIn = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    signedIn = !error;
  }

  if (signedIn) {
    // Only ever redirect within this app; never to a URL from the query.
    const path = next.startsWith("/") && !next.startsWith("//") ? next : "/intakes";
    return NextResponse.redirect(`${origin}${path}`);
  }

  return NextResponse.redirect(`${origin}/login?error=link`);
}
