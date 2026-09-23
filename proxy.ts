import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAllowedEmail, isPublicPath } from "@/lib/auth/access";

/**
 * The gate on the whole application.
 *
 * The Hub used to be readable by anyone with the URL, and only /intakes was
 * protected. It now holds client intake data alongside the standards, and the
 * decision is that all of it is internal, so this denies by default: every
 * request is authenticated unless lib/auth/access.ts exempts it.
 *
 * The client questionnaire at /intake/<token> is the one substantive
 * exemption. Its token is its credential, and it is served to people who do
 * not have Microsoft accounts with us.
 */
export async function proxy(request: NextRequest) {
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

export const config = {
  matcher: [
    /*
     * Everything except Next internals and static files. The handler decides
     * what is public; this only keeps the middleware off asset requests, which
     * would otherwise pay for a Supabase round trip each.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
