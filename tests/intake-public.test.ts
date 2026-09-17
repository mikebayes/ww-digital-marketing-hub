import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  acceptClientAnswers,
  buildSteps,
  isOpenForClient,
  isVisibleToClient,
  normalizeAnswer,
  resolveClientValue,
  toPublicIntake,
  visibleQuestions,
} from "../lib/intake/public.ts";
import type { IntakeQuestion } from "../lib/intake/types.ts";

/**
 * These cover the boundary between internal and client-facing data. A failure
 * here is a client reading something we wrote about them, so the assertions are
 * about absence as much as presence.
 */

function question(overrides: Partial<IntakeQuestion> = {}): IntakeQuestion {
  return {
    id: "q1",
    intake_id: "i1",
    question_definition_id: "d1",
    service_id: "s1",
    section: "Business & priorities",
    question_key: "business_goals",
    question_text: "What are the main business goals?",
    help_text: null,
    field_type: "textarea",
    options: [],
    client_step: "Your Business",
    client_step_order: 10,
    sort_order: 100,
    included: true,
    required_mode: "optional",
    client_visible: true,
    client_editable: true,
    prefill_answer: null,
    client_answer: null,
    final_answer: null,
    internal_notes: null,
    ...overrides,
  };
}

describe("visibility", () => {
  test("drops excluded questions", () => {
    const result = visibleQuestions([
      question({ id: "a" }),
      question({ id: "b", included: false }),
    ]);
    assert.deepEqual(
      result.map((q) => q.id),
      ["a"],
    );
  });

  test("drops internal-only questions", () => {
    const result = visibleQuestions([
      question({ id: "a" }),
      question({ id: "internal", client_visible: false }),
    ]);
    assert.deepEqual(
      result.map((q) => q.id),
      ["a"],
    );
  });

  test("orders by step then sort order", () => {
    const result = visibleQuestions([
      question({ id: "late-step", client_step_order: 60, sort_order: 10 }),
      question({ id: "early-step-late", client_step_order: 10, sort_order: 900 }),
      question({ id: "early-step-early", client_step_order: 10, sort_order: 100 }),
    ]);
    assert.deepEqual(
      result.map((q) => q.id),
      ["early-step-early", "early-step-late", "late-step"],
    );
  });
});

describe("public projection", () => {
  test("never emits internal notes or the final answer", () => {
    const intake = toPublicIntake({
      clientName: "All Weather",
      status: "sent",
      submittedAt: null,
      questions: [
        question({
          internal_notes: "Client was vague on budget, push at kickoff",
          final_answer: "Internal resolution the client must not read",
        }),
      ],
    });

    const serialized = JSON.stringify(intake);
    assert.ok(!serialized.includes("push at kickoff"));
    assert.ok(!serialized.includes("Internal resolution"));
    assert.ok(!serialized.includes("internal_notes"));
    assert.ok(!serialized.includes("final_answer"));
  });

  test("an internal-only question contributes nothing to the payload", () => {
    const intake = toPublicIntake({
      clientName: "All Weather",
      status: "sent",
      submittedAt: null,
      questions: [
        question({
          id: "internal",
          question_key: "internal_handoff_context",
          question_text: "Sales and handoff context",
          prefill_answer: "Sold by Dana, margin was tight",
          client_visible: false,
          client_step: null,
        }),
      ],
    });

    assert.deepEqual(intake.steps, []);
    assert.ok(!JSON.stringify(intake).includes("margin was tight"));
  });

  test("groups questions into steps in data-defined order", () => {
    const intake = toPublicIntake({
      clientName: "All Weather",
      status: "sent",
      submittedAt: null,
      questions: [
        question({ id: "c", client_step: "Access", client_step_order: 60 }),
        question({ id: "a", client_step: "Your Business", client_step_order: 10 }),
        question({
          id: "b",
          client_step: "Social Channels",
          client_step_order: 40,
        }),
      ],
    });

    assert.deepEqual(
      intake.steps.map((s) => s.title),
      ["Your Business", "Social Channels", "Access"],
    );
  });

  test("questions sharing a step name merge across services", () => {
    const steps = buildSteps([
      question({
        id: "common",
        service_id: "common",
        client_step: "Audience & Content Direction",
        client_step_order: 20,
        sort_order: 200,
      }),
      question({
        id: "social",
        service_id: "social",
        client_step: "Audience & Content Direction",
        client_step_order: 20,
        sort_order: 500,
      }),
    ]);

    assert.equal(steps.length, 1);
    assert.deepEqual(
      steps[0].questions.map((q) => q.id),
      ["common", "social"],
    );
  });

  test("a question with no step still reaches the client", () => {
    const steps = buildSteps([question({ client_step: null })]);
    assert.equal(steps.length, 1);
    assert.equal(steps[0].title, "Anything Else");
  });
});

describe("resolving the value the client sees", () => {
  test("prefers the client answer over the pre-fill", () => {
    assert.equal(
      resolveClientValue(
        question({ prefill_answer: "ours", client_answer: "theirs" }),
      ),
      "theirs",
    );
  });

  test("falls back to the pre-fill when the client has not answered", () => {
    assert.equal(
      resolveClientValue(question({ prefill_answer: "ours" })),
      "ours",
    );
  });

  test("an empty client answer is an answer, not a fallback", () => {
    assert.equal(
      resolveClientValue(question({ prefill_answer: "ours", client_answer: "" })),
      "",
    );
  });
});

describe("accepting client answers", () => {
  test("ignores answers to questions that were never shown", () => {
    const questions = [
      question({ id: "visible" }),
      question({ id: "internal", client_visible: false }),
      question({ id: "excluded", included: false }),
    ];

    const accepted = acceptClientAnswers(questions, {
      visible: "fine",
      internal: "should not be written",
      excluded: "should not be written",
      "not-a-question-at-all": "should not be written",
    });

    assert.deepEqual(
      accepted.map((a) => a.id),
      ["visible"],
    );
  });

  test("ignores answers to read-only questions", () => {
    const accepted = acceptClientAnswers(
      [question({ id: "locked", client_editable: false })],
      { locked: "client tried to change this" },
    );
    assert.deepEqual(accepted, []);
  });
});

describe("answer normalisation", () => {
  test("blank text becomes null rather than an empty string", () => {
    assert.equal(normalizeAnswer({ field_type: "text", options: [] }, "   "), null);
  });

  test("multiselect rejects values that were not offered", () => {
    assert.deepEqual(
      normalizeAnswer(
        { field_type: "multiselect", options: ["Facebook", "Instagram"] },
        ["Facebook", "Myspace"],
      ),
      ["Facebook"],
    );
  });

  test("select rejects a value that was not offered", () => {
    assert.equal(
      normalizeAnswer(
        { field_type: "select", options: ["Complete", "Unsure"] },
        "Something else",
      ),
      null,
    );
  });

  test("an array posted to a text field is rejected", () => {
    assert.equal(
      normalizeAnswer({ field_type: "text", options: [] }, ["a", "b"]),
      null,
    );
  });
});

describe("link liveness", () => {
  test("an unsent intake is not readable even with the right token", () => {
    assert.equal(isVisibleToClient("draft"), false);
    assert.equal(isVisibleToClient("ready"), false);
  });

  test("a sent intake is readable and open", () => {
    assert.equal(isVisibleToClient("sent"), true);
    assert.equal(isOpenForClient("sent"), true);
    assert.equal(isOpenForClient("in_progress"), true);
  });

  test("a submitted intake is readable but closed to further edits", () => {
    assert.equal(isVisibleToClient("submitted"), true);
    assert.equal(isOpenForClient("submitted"), false);
    assert.equal(isOpenForClient("complete"), false);
  });
});
