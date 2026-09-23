import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  availableActions,
  canTransition,
  effectiveAnswer,
  outstandingQuestions,
  STATUS_ORDER,
  timestampsFor,
} from "../lib/intake/status.ts";
import {
  clientIntakeUrl,
  generatePublicToken,
  isPlausibleToken,
  resolveOrigin,
} from "../lib/intake/token.ts";
import type { IntakeQuestion, IntakeStatus } from "../lib/intake/types.ts";

function question(overrides: Partial<IntakeQuestion> = {}): IntakeQuestion {
  return {
    id: "q1",
    intake_id: "i1",
    question_definition_id: "d1",
    service_id: "s1",
    section: "Contacts",
    question_key: "primary_contact",
    question_text: "Who should be our primary working contact?",
    help_text: null,
    field_type: "text",
    options: [],
    client_step: "Approvals & Working Together",
    client_step_order: 50,
    sort_order: 400,
    included: true,
    required_mode: "required_by_completion",
    client_visible: true,
    client_editable: true,
    prefill_answer: null,
    client_answer: null,
    final_answer: null,
    internal_notes: null,
    ...overrides,
  };
}

describe("tokens", () => {
  test("are long enough to be a credential", () => {
    const token = generatePublicToken();
    assert.ok(token.length >= 43, `expected >= 43 chars, got ${token.length}`);
  });

  test("are url safe", () => {
    for (let i = 0; i < 50; i++) {
      assert.match(generatePublicToken(), /^[A-Za-z0-9_-]+$/);
    }
  });

  test("do not repeat", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 500; i++) seen.add(generatePublicToken());
    assert.equal(seen.size, 500);
  });

  test("a generated token passes the shape check", () => {
    assert.equal(isPlausibleToken(generatePublicToken()), true);
  });

  test("obvious rubbish is rejected before it reaches the database", () => {
    assert.equal(isPlausibleToken(""), false);
    assert.equal(isPlausibleToken("short"), false);
    assert.equal(isPlausibleToken("../../etc/passwd"), false);
    assert.equal(isPlausibleToken("a".repeat(31)), false);
    assert.equal(isPlausibleToken("a".repeat(65)), false);
    assert.equal(isPlausibleToken(`${"a".repeat(40)} or 1=1`), false);
  });

  test("builds a client url without doubling the slash", () => {
    assert.equal(
      clientIntakeUrl("https://hub.example.com/", "abc"),
      "https://hub.example.com/intake/abc",
    );
  });
});

describe("lifecycle", () => {
  test("every status offers at least one action", () => {
    for (const status of STATUS_ORDER) {
      assert.ok(
        availableActions(status).length > 0,
        `${status} is a dead end`,
      );
    }
  });

  test("the happy path runs draft to complete", () => {
    const path: IntakeStatus[] = [
      "draft",
      "ready",
      "sent",
      "submitted",
      "reviewed",
      "complete",
    ];
    for (let i = 0; i < path.length - 1; i++) {
      assert.ok(
        canTransition(path[i], path[i + 1]),
        `${path[i]} should reach ${path[i + 1]}`,
      );
    }
  });

  test("a draft cannot skip straight to complete", () => {
    assert.equal(canTransition("draft", "complete"), false);
    assert.equal(canTransition("draft", "sent"), false);
  });

  test("a submitted intake can be reopened for the client", () => {
    assert.equal(canTransition("submitted", "in_progress"), true);
  });

  test("entering a status stamps only its own timestamp", () => {
    assert.deepEqual(Object.keys(timestampsFor("sent")), ["sent_at"]);
    assert.deepEqual(Object.keys(timestampsFor("submitted")), ["submitted_at"]);
    assert.deepEqual(timestampsFor("draft"), {});
  });
});

describe("what we still owe", () => {
  test("prefers the final answer, then the client answer, then the pre-fill", () => {
    assert.equal(
      effectiveAnswer(
        question({
          prefill_answer: "guess",
          client_answer: "client said",
          final_answer: "agreed at kickoff",
        }),
      ),
      "agreed at kickoff",
    );
    assert.equal(
      effectiveAnswer(question({ prefill_answer: "guess", client_answer: "client said" })),
      "client said",
    );
    assert.equal(effectiveAnswer(question({ prefill_answer: "guess" })), "guess");
  });

  test("lists required-by-completion questions that are still blank", () => {
    const outstanding = outstandingQuestions([
      question({ id: "blank" }),
      question({ id: "answered", client_answer: "Priya" }),
      question({ id: "optional-blank", required_mode: "optional" }),
      question({ id: "excluded", included: false }),
    ]);

    assert.deepEqual(
      outstanding.map((q) => q.id),
      ["blank"],
    );
  });

  test("whitespace and an empty multiselect both count as blank", () => {
    const outstanding = outstandingQuestions([
      question({ id: "spaces", client_answer: "   " }),
      question({
        id: "empty-list",
        field_type: "multiselect",
        client_answer: [],
      }),
    ]);
    assert.equal(outstanding.length, 2);
  });
});

describe("client link origin", () => {
  test("uses http for localhost, where there is no TLS to assume", () => {
    assert.equal(resolveOrigin("localhost:3000", null), "http://localhost:3000");
    assert.equal(resolveOrigin("127.0.0.1:3000", null), "http://127.0.0.1:3000");
  });

  test("uses https for a real host", () => {
    assert.equal(
      resolveOrigin("ww-digital-marketing-hub.vercel.app", null),
      "https://ww-digital-marketing-hub.vercel.app",
    );
  });

  test("trusts the proxy's scheme when it sets one", () => {
    assert.equal(
      resolveOrigin("ww-digital-marketing-hub.vercel.app", "https"),
      "https://ww-digital-marketing-hub.vercel.app",
    );
    // Some proxies send a comma-separated chain; the first hop is ours.
    assert.equal(resolveOrigin("example.com", "https, http"), "https://example.com");
  });

  test("falls back rather than producing a schemeless url", () => {
    assert.equal(resolveOrigin(null, null), "http://localhost:3000");
  });

  test("builds a link that is actually openable in development", () => {
    const url = clientIntakeUrl(resolveOrigin("localhost:3000", null), "abc123");
    assert.equal(url, "http://localhost:3000/intake/abc123");
  });
});
