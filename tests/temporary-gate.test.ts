import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";

import {
  ACCESS_COOKIE,
  accessKey,
  accessToken,
  constantTimeEqual,
  isGateConfigured,
  isGatedPath,
  isValidKey,
  isValidToken,
} from "../lib/auth/temporary-gate.ts";

/**
 * TEMPORARY — delete with lib/auth/temporary-gate.ts.
 *
 * The shared key is the only thing standing between the open internet and
 * client intake records while Microsoft sign-in is unavailable, so the two
 * things that matter are covered here: that it holds /intakes, and that it
 * does not touch the client questionnaire.
 */

const KEY = "correct-horse-battery-staple-9f2a";
let original: string | undefined;

before(() => {
  original = process.env.INTAKES_ACCESS_KEY;
  process.env.INTAKES_ACCESS_KEY = KEY;
});

after(() => {
  if (original === undefined) delete process.env.INTAKES_ACCESS_KEY;
  else process.env.INTAKES_ACCESS_KEY = original;
});

describe("what the key holds", () => {
  test("the intake admin and everything under it", () => {
    for (const path of [
      "/intakes",
      "/intakes/new",
      "/intakes/8f1c-2b/edit",
      "/intakes/8f1c-2b/preview",
    ]) {
      assert.equal(isGatedPath(path), true, path);
    }
  });

  test("the client questionnaire is not held", () => {
    /*
     * The one that would be silently wrong: "/intakes" starts with "/intake",
     * so a prefix match on the shorter string asks clients for a staff key.
     */
    for (const path of [
      "/intake/abc123",
      "/intake/abc123/thank-you",
      "/intake",
    ]) {
      assert.equal(isGatedPath(path), false, path);
    }
  });

  test("documentation is public again while this is in force", () => {
    for (const path of [
      "/",
      "/what-we-sell",
      "/client-onboarding/overview",
      "/service-onboarding/social-media/setup-launch",
      "/ongoing-delivery/social-media",
      "/templates-resources",
      "/unlock",
      "/login",
    ]) {
      assert.equal(isGatedPath(path), false, path);
    }
  });

  test("a route merely containing the word is not held", () => {
    assert.equal(isGatedPath("/standards/intakes-policy"), false);
    assert.equal(isGatedPath("/intakes-policy"), false);
  });
});

describe("checking a supplied key", () => {
  test("the configured key is accepted", async () => {
    assert.equal(await isValidKey(KEY), true);
  });

  test("anything else is refused", async () => {
    for (const wrong of [
      "",
      " ",
      KEY.slice(0, -1),
      KEY + "x",
      KEY.toUpperCase(),
      "correct-horse-battery-staple-9f2b",
    ]) {
      assert.equal(await isValidKey(wrong), false, JSON.stringify(wrong));
    }
  });
});

describe("the cookie", () => {
  test("carries a digest, not the key", async () => {
    const token = await accessToken(KEY);
    assert.match(token, /^[0-9a-f]{64}$/);
    assert.ok(!token.includes(KEY));
  });

  test("a token minted from the key is accepted", async () => {
    assert.equal(await isValidToken(await accessToken(KEY)), true);
  });

  test("the raw key in the cookie is not enough", async () => {
    // Someone who learns the key still cannot hand-craft the cookie value.
    assert.equal(await isValidToken(KEY), false);
  });

  test("a missing or forged cookie is refused", async () => {
    assert.equal(await isValidToken(undefined), false);
    assert.equal(await isValidToken(""), false);
    assert.equal(await isValidToken("f".repeat(64)), false);
    assert.equal(await isValidToken(await accessToken("some-other-key")), false);
  });

  test("rotating the key invalidates cookies already issued", async () => {
    const issued = await accessToken(KEY);
    process.env.INTAKES_ACCESS_KEY = "rotated-key-0001";
    try {
      assert.equal(await isValidToken(issued), false);
    } finally {
      process.env.INTAKES_ACCESS_KEY = KEY;
    }
  });

  test("the cookie is not named anything a client would see", () => {
    assert.equal(ACCESS_COOKIE, "ww-intakes-access");
  });
});

describe("when no key is configured", () => {
  test("nothing is accepted and the proxy can tell", async () => {
    delete process.env.INTAKES_ACCESS_KEY;
    try {
      assert.equal(isGateConfigured(), false);
      assert.equal(accessKey(), undefined);
      assert.equal(await isValidKey("anything"), false);
      assert.equal(await isValidToken("f".repeat(64)), false);
    } finally {
      process.env.INTAKES_ACCESS_KEY = KEY;
    }
  });

  test("an empty string counts as unconfigured", () => {
    process.env.INTAKES_ACCESS_KEY = "";
    try {
      assert.equal(isGateConfigured(), false);
    } finally {
      process.env.INTAKES_ACCESS_KEY = KEY;
    }
  });
});

describe("comparison", () => {
  test("equal and unequal values are told apart", () => {
    assert.equal(constantTimeEqual("abc", "abc"), true);
    assert.equal(constantTimeEqual("abc", "abd"), false);
    assert.equal(constantTimeEqual("abc", "abcd"), false);
    assert.equal(constantTimeEqual("", ""), true);
  });
});

describe("after the module moved to /client-questionnaires/admin", () => {
  test("the new admin route and everything under it is held", () => {
    for (const path of [
      "/client-questionnaires/admin",
      "/client-questionnaires/admin/new",
      "/client-questionnaires/admin/8f1c-2b",
      "/client-questionnaires/admin/8f1c-2b/questions",
      "/client-questionnaires/admin/8f1c-2b/responses",
      "/client-questionnaires/admin/8f1c-2b/client-access",
      "/client-questionnaires/admin/8f1c-2b/settings",
      "/client-questionnaires/admin/8f1c-2b/document",
      "/client-questionnaires/admin/preview/8f1c-2b",
    ]) {
      assert.equal(isGatedPath(path), true, path);
    }
  });

  test("the old routes stay held, because they redirect into the new ones", () => {
    // An ungated redirect into a gated route is one missed case away from
    // being an ungated route.
    for (const path of ["/intakes", "/intakes/new", "/intakes/8f1c-2b/edit"]) {
      assert.equal(isGatedPath(path), true, path);
    }
  });

  test("the section index is documentation and stays open", () => {
    assert.equal(isGatedPath("/client-questionnaires"), false);
  });

  test("a documentation page under the section is not swept in", () => {
    // The failure this guards: prefix-matching "/client-questionnaires/admin"
    // without a boundary would gate a page written to be read.
    assert.equal(
      isGatedPath("/client-questionnaires/administration-guide"),
      false,
    );
    assert.equal(isGatedPath("/client-questionnaires/admin-overview"), false);
  });

  test("the client questionnaire is still not held", () => {
    assert.equal(isGatedPath("/intake/abc123"), false);
  });
});
