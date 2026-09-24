import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  ALLOWED_EMAIL_DOMAIN,
  isAllowedEmail,
  isPublicPath,
  safeNext,
} from "../lib/auth/access.ts";

/**
 * The Hub is internal. These cover the boundary that makes it so — a failure
 * here is either a stranger reading client work, or staff locked out of it.
 *
 * DORMANT (2026-09-24): nothing calls these right now. Microsoft sign-in is
 * disabled and there is no proxy.ts, so the whole Hub is open — see
 * lib/auth/microsoft-gate.ts for why and how to bring it back.
 *
 * They are still run, deliberately. These are the rules the Hub returns to,
 * and a rule that stops being tested while it waits is a rule that comes back
 * broken. What they assert is what SHOULD be true, not what is true today.
 */

describe("what is public", () => {
  test("the whole Hub is protected by default", () => {
    for (const path of [
      "/",
      "/what-we-sell",
      "/standards/brand-document-deliverable-standards",
      "/client-onboarding/overview",
      "/service-onboarding/social-media/service-standards",
      "/service-onboarding/social-media/setup-launch",
      "/ongoing-delivery/social-media",
      "/templates-resources",
      "/intakes",
      "/intakes/new",
      "/intakes/abc-123/edit",
    ]) {
      assert.equal(isPublicPath(path), false, `${path} should be protected`);
    }
  });

  test("a route nobody thought about is protected, not exposed", () => {
    assert.equal(isPublicPath("/some-future-tool"), false);
    assert.equal(isPublicPath("/reports/2026/q1"), false);
  });

  test("the client questionnaire stays public", () => {
    assert.equal(isPublicPath("/intake/aVeryLongOpaqueToken"), true);
  });

  test("the staff admin is not published by the questionnaire's prefix", () => {
    // /intakes starts with /intake. A loose prefix here would expose it.
    assert.equal(isPublicPath("/intakes"), false);
    assert.equal(isPublicPath("/intakes/anything"), false);
  });

  test("sign-in and the OAuth callback are reachable signed out", () => {
    assert.equal(isPublicPath("/login"), true);
    assert.equal(isPublicPath("/auth/callback"), true);
  });

  test("assets the login page needs are reachable", () => {
    assert.equal(isPublicPath("/brand/logos/svg/webwizards-dark-bg.svg"), true);
    assert.equal(isPublicPath("/_next/static/chunks/main.js"), true);
    assert.equal(isPublicPath("/robots.txt"), true);
    assert.equal(isPublicPath("/favicon.ico"), true);
  });
});

describe("who is allowed in", () => {
  test("a Web Wizards address is allowed", () => {
    assert.equal(isAllowedEmail(`mike@${ALLOWED_EMAIL_DOMAIN}`), true);
    assert.equal(isAllowedEmail(`MIKE@WEBWIZARDS.CA`), true);
  });

  test("anything else is not, however it authenticated", () => {
    for (const email of [
      "someone@gmail.com",
      "guest@partner.com",
      "attacker@webwizards.ca.evil.com",
      "attacker@notwebwizards.ca",
      "webwizards.ca@gmail.com",
      "",
      null,
      undefined,
    ]) {
      assert.equal(isAllowedEmail(email), false, `${email} should be denied`);
    }
  });

  test("a subdomain of the tenant is not the tenant", () => {
    assert.equal(isAllowedEmail("someone@mail.webwizards.ca"), false);
  });
});

describe("returning to where you were going", () => {
  test("an internal path is preserved", () => {
    assert.equal(safeNext("/intakes/abc/edit"), "/intakes/abc/edit");
    assert.equal(
      safeNext("/service-onboarding/social-media/setup-launch"),
      "/service-onboarding/social-media/setup-launch",
    );
  });

  test("an absolute url cannot be used as an open redirect", () => {
    assert.equal(safeNext("https://evil.com"), "/");
    assert.equal(safeNext("//evil.com"), "/");
    assert.equal(safeNext("javascript:alert(1)"), "/");
  });

  test("nothing sends the user back to the login page", () => {
    assert.equal(safeNext("/login"), "/");
    assert.equal(safeNext("/login?next=%2Fintakes"), "/");
  });

  test("missing falls back to the Hub root", () => {
    assert.equal(safeNext(null), "/");
    assert.equal(safeNext(undefined), "/");
    assert.equal(safeNext(""), "/");
  });
});
