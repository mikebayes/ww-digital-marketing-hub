import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  UNLOCK_PATH,
  isGateConfigured,
  isGatedPath,
  isValidToken,
} from "@/lib/auth/temporary-gate";

/**
 * TEMPORARY — the gate on /intakes, and only /intakes.
 *
 * ==========================================================================
 * The real gate is dormant in lib/auth/microsoft-gate.ts, which is where this
 * file's contents came from and where they go back to. That one denies by
 * default across the whole application; this one protects a single subtree
 * and lets everything else through, because while Microsoft sign-in is
 * unavailable the documentation Hub is deliberately open.
 *
 * /intakes is the exception because the intake admin now queries as the
 * service role. RLS is not underneath it, so "open" there would mean client
 * intake records readable and writable by anyone with the URL.
 *
 * Reactivating Microsoft replaces this whole file — the steps are in the
 * header of lib/auth/microsoft-gate.ts.
 * ==========================================================================
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The matcher below should mean this never fires, but the gate should not
  // depend on the matcher staying narrow.
  if (!isGatedPath(pathname)) return NextResponse.next();

  /*
   * Fail closed. A deployment with no key configured cannot tell staff from
   * anyone else, and client intake records are not the thing to guess with.
   */
  if (!isGateConfigured()) {
    return NextResponse.redirect(
      new URL(`${UNLOCK_PATH}?error=unconfigured`, request.url),
    );
  }

  if (await isValidToken(request.cookies.get(ACCESS_COOKIE)?.value)) {
    return NextResponse.next();
  }

  const unlock = new URL(UNLOCK_PATH, request.url);
  unlock.searchParams.set("next", pathname + request.nextUrl.search);
  return NextResponse.redirect(unlock);
}

export const config = {
  /*
   * TEMPORARY: narrowed to the intake admin. The documentation pages are
   * public for now and never reach this handler. The permanent matcher is
   * "/((?!_next/static|_next/image|favicon.ico).*)" — see microsoft-gate.ts.
   */
  matcher: ["/intakes", "/intakes/:path*"],
};
