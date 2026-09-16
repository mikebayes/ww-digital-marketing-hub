import type { MetadataRoute } from "next";

/**
 * Crawling is deliberately allowed.
 *
 * The Hub is kept out of search results by `noindex` — a meta tag on every
 * page plus an `X-Robots-Tag` response header on every route. Both only work
 * if a crawler can actually fetch the URL and read the directive.
 *
 * Do not add `disallow` here. Blocking the path stops crawlers seeing the
 * noindex at all, which leaves URLs eligible to appear in results on the
 * strength of inbound links alone — the opposite of what we want.
 *
 * Keeping the Hub genuinely private is an access-control problem, not a
 * robots one.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
  };
}
