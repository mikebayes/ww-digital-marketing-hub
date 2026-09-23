import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { authLandingTarget } from "@/lib/intake/token";

/**
 * Session refresh and the gate on internal client data.
 *
 * Only /intakes is gated. The documentation pages that make up the rest of the
 * Hub hold no client information and stayed readable to anyone with the URL
 * before this feature existed; gating them now would be a change to the Hub
 * rather than an addition to it. Extending the gate is the PROTECTED list
 * below and nothing else.
 *
 * The client questionnaire at /intake/<token> is deliberately not gated. Its
 * token is its credential.
 */
const PROTECTED = ["/intakes"];

function isProtected(pathname: string): boolean {
  return PROTECTED.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/*
 * See authLandingTarget in lib/intake/token.ts for why this exists.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const landing = authLandingTarget(pathname, request.nextUrl.searchParams);
  if (landing) return NextResponse.redirect(new URL(landing, request.url));

  if (!isProtected(pathname)) return NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  /*
   * Fail closed. An unconfigured deployment cannot verify anyone, so it must
   * not serve client data on the assumption that nobody is logged in either.
   */
  if (!url || !anonKey) {
    return NextResponse.redirect(new URL("/login?error=unconfigured", request.url));
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
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except Next internals and static files. The handler itself
     * decides what is protected; this only keeps the middleware off asset
     * requests.
     */
    "/((?!_next/static|_next/image|favicon.ico|brand/|templates/|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|pdf|zip|txt|xml)$).*)",
  ],
};
