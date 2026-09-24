import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { stat } from "node:fs/promises";

import { isGatedPath } from "../lib/auth/temporary-gate.ts";

/**
 * Which layout wraps which route.
 *
 * In the App Router a route group decides the layout, and nothing about the
 * URL shows which group a file is in. That is how the client preview ended up
 * rendering inside app/(hub) with the full Hub rail down its left side: the
 * path looked right, the page looked wrong, and no test could tell.
 *
 * So the file locations are asserted here. A preview wearing internal
 * navigation is not a preview — it is a different page that happens to
 * contain the same questions.
 */

const exists = async (path: string) => {
  try {
    await stat(new URL(`../${path}`, import.meta.url));
    return true;
  } catch {
    return false;
  }
};

describe("the client-facing routes render outside the Hub shell", () => {
  test("the questionnaire preview is not in the (hub) group", async () => {
    assert.equal(
      await exists("app/client-questionnaires/admin/preview/[id]/page.tsx"),
      true,
      "preview must live outside app/(hub) so it does not inherit the rail",
    );
    assert.equal(
      await exists("app/(hub)/client-questionnaires/admin/preview/[id]/page.tsx"),
      false,
      "a copy inside app/(hub) would shadow it with the Hub layout",
    );
  });

  test("the client questionnaire is not in the (hub) group", async () => {
    assert.equal(await exists("app/intake/[token]/page.tsx"), true);
    assert.equal(await exists("app/(hub)/intake/[token]/page.tsx"), false);
  });

  test("the admin tabs are in the (hub) group, where the shell belongs", async () => {
    for (const page of [
      "app/(hub)/client-questionnaires/admin/page.tsx",
      "app/(hub)/client-questionnaires/admin/[id]/page.tsx",
      "app/(hub)/client-questionnaires/admin/[id]/questions/page.tsx",
      "app/(hub)/client-questionnaires/admin/[id]/responses/page.tsx",
    ]) {
      assert.equal(await exists(page), true, page);
    }
  });
});

describe("moving the preview did not move it out of the gate", () => {
  test("it is still behind the admin key", () => {
    // The URL is what the gate matches, and route groups do not appear in
    // URLs — so the move is invisible to it. Asserted anyway, because that
    // is exactly the kind of thing a refactor breaks quietly.
    assert.equal(
      isGatedPath("/client-questionnaires/admin/preview/8f1c-2b"),
      true,
    );
  });

  test("the client questionnaire is still not behind it", () => {
    assert.equal(isGatedPath("/intake/abc123"), false);
  });
});
