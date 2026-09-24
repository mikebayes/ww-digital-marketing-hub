import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAllowedEmail, isPublicPath } from "@/lib/auth/access";

/**
 * The Microsoft gate — DORMANT.
 *
 * ==========================================================================
 * This was the body of proxy.ts until 2026-09-24. It is not wired to
 * anything: there is no proxy.ts, so no middleware runs and the Hub is open.
 *
 * It was disabled because the Azure provider in Supabase holds a Secret ID
 * where its Secret Value belongs, so Microsoft's token exchange fails with
 * AADSTS7000215 and nobody can sign in. The Entra app itself is correct —
 * tenant, client ID, redirect URI and scope were all verified against Entra
 * directly. Only the secret is wrong, and the administrator who can reissue
 * it is away.
 *
 * It is kept rather than deleted, and kept compiling rather than commented
 * out, so it cannot quietly rot while it waits. The rules it enforces live in
 * lib/auth/access.ts and are still covered by tests/auth-access.test.ts.
 *
 * TO REACTIVATE, once Supabase holds a valid Azure client secret Value:
 *
 *   1. create proxy.ts at the repository root:
 *
 *        import { microsoftGate } from "@/lib/auth/microsoft-gate";
 *        export const proxy = microsoftGate;
 *        export const config = {
 *          matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
 *        };
 *
 *   2. put `import { createClient } from "@/lib/supabase/server";` back at the
 *      top of lib/intake/queries.ts, replacing the local createClient() there
 *   3. render <SignOutButton /> again in SiteRail and MobileBar
 *   4. delete this paragraph and the one above it
 * ==========================================================================
 *
 * The gate denies by default: every request is authenticated unless
 * lib/auth/access.ts exempts it, so a route added later is protected because
 * nobody remembered to protect it, rather than exposed because nobody
 * remembered to list it.
 *
 * The client questionnaire at /intake/<token> is the one substantive
 * exemption. Its token is its credential, and it is served to people who do
 * not have Microsoft accounts with us.
 */
export async function microsoftGate(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) return NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  /*
   * Fail closed. A deployment that cannot verify anyone must not serve
   * internal material on the assumption that nobody is signed in either.
   */
  if (!url || !anonKey) {
    return NextResponse.redirect(
      new URL("/login?error=unconfigured", request.url),
    );
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser, not getSession: this revalidates the token with Supabase rather
  // than trusting a cookie the browser handed us.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(login);
  }

  /*
   * A session for someone outside Web Wizards should not exist — the callback
   * signs those out before a cookie is ever set. Checked again anyway, because
   * a gate that only works when the door upstream held is not a gate.
   */
  if (!isAllowedEmail(user.email)) {
    return NextResponse.redirect(new URL("/login?error=denied", request.url));
  }

  return response;
}
