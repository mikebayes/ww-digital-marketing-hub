import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  acceptClientAnswers,
  attributionFor,
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
    step_intro: null,
    sort_order: 100,
    included: true,
    required_mode: "optional",
    client_visible: true,
    client_editable: true,
    prefill_answer: null,
    client_answer: null,
    answered_by_contact_id: null,
    answered_at: null,
    answer_revision_count: 0,
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

  test("only Web Wizards closes it", () => {
    // A contact finishing no longer closes the questionnaire for everyone, so
    // a record left in "submitted" by the old behaviour is still editable.
    assert.equal(isOpenForClient("submitted"), true);
    assert.equal(isOpenForClient("reviewed"), true);
    assert.equal(isVisibleToClient("complete"), true);
    assert.equal(isOpenForClient("complete"), false);
  });
});

/**
 * The projection above is the guarantee; the query is the second line behind
 * it. This reads the source rather than the behaviour, because the failure it
 * guards against is somebody reaching for select("*") one day and nothing
 * looking any different until a client reads an internal note.
 *
 * It matters more than it used to: while the Hub is unauthenticated the
 * internal admin queries as the service role, so RLS is not underneath any of
 * this any more. See lib/intake/queries.ts.
 */
describe("what the public query is allowed to ask for", async () => {
  const source = await readFile(
    new URL("../lib/intake/public-queries.ts", import.meta.url),
    "utf8",
  );

  test("never selects every column", () => {
    assert.ok(
      !/\.select\(\s*["'`]\s*\*/.test(source),
      "the public path must name its columns",
    );
  });

  test("internal-only columns are not among the ones it names", () => {
    for (const column of ["internal_notes", "final_answer"]) {
      assert.ok(
        !new RegExp(`["']${column}["']`).test(source),
        `${column} must never be selected on the public path`,
      );
    }
  });

  test("a client can only address an intake by its token", () => {
    // No public entry point takes an intake id, so one client cannot ask for
    // another client's intake by guessing a uuid.
    assert.ok(!/export\s+async\s+function\s+\w+\(\s*\w*[Ii]ntakeId/.test(source));
  });
});

/**
 * A step can introduce itself.
 *
 * Stored on a question because steps are not rows — they are produced by
 * grouping on client_step, so a service composes its own without any schema
 * knowing about it. That makes "which question carries it" a real question,
 * and these answer it.
 */
describe("step introductions", () => {
  test("the intro is lifted off the question onto the step", () => {
    const steps = buildSteps([
      question({
        id: "a",
        client_step: "Access",
        client_step_order: 60,
        sort_order: 10,
        step_intro: "We will be managing three channels with your team.",
      }),
      question({
        id: "b",
        client_step: "Access",
        client_step_order: 60,
        sort_order: 20,
      }),
    ]);
    assert.equal(steps.length, 1);
    assert.equal(steps[0].intro, "We will be managing three channels with your team.");
  });

  test("a step whose questions carry none has none", () => {
    const steps = buildSteps([question({ id: "a" })]);
    assert.equal(steps[0].intro, null);
  });

  test("the first one wins rather than being concatenated", () => {
    // Two intros on one step is a seeding mistake. Joining them would hide it.
    const steps = buildSteps([
      question({ id: "a", sort_order: 10, step_intro: "First." }),
      question({ id: "b", sort_order: 20, step_intro: "Second." }),
    ]);
    assert.equal(steps[0].intro, "First.");
  });

  test("whitespace is not an introduction", () => {
    const steps = buildSteps([question({ id: "a", step_intro: "   " })]);
    assert.equal(steps[0].intro, null);
  });

  test("an intro never carries an internal-only question into view", () => {
    // The intro rides on a question; the projection still decides which
    // questions exist. An internal question's intro must not create a step.
    const steps = buildSteps([
      question({
        id: "hidden",
        client_visible: false,
        client_step: "Access",
        step_intro: "Internal preamble.",
      }),
    ]);
    assert.deepEqual(steps, []);
  });
});

describe("when the client link works", () => {
  test("a draft is not reachable", () => {
    // Make Live is what opens the URL. Before that the token 404s.
    assert.equal(isVisibleToClient("draft"), false);
    assert.equal(isVisibleToClient("ready"), false);
  });

  test("going live opens it immediately", () => {
    assert.equal(isVisibleToClient("sent"), true);
    assert.equal(isOpenForClient("sent"), true);
  });

  test("it stays open while live, whatever the stored status says", () => {
    for (const status of ["sent", "in_progress", "submitted", "reviewed"] as const) {
      assert.equal(isOpenForClient(status), true, status);
    }
  });

  test("Complete is the only thing that makes it read-only", () => {
    assert.equal(isVisibleToClient("complete"), true);
    assert.equal(isOpenForClient("complete"), false);
  });
});

describe("the client-facing title", () => {
  test("carries the questionnaire name, resolved", () => {
    const intake = toPublicIntake({
      clientName: "All Weather at Home",
      title: "Social Media Questionnaire",
      status: "sent",
      submittedAt: null,
      questions: [question({ id: "a" })],
    });
    assert.equal(intake.title, "Social Media Questionnaire");
    assert.equal(
      `${intake.clientName} | ${intake.title} | Web Wizards`,
      "All Weather at Home | Social Media Questionnaire | Web Wizards",
    );
  });

  test("an unnamed questionnaire still gets a client-facing title", () => {
    const intake = toPublicIntake({
      clientName: "Acme",
      status: "sent",
      submittedAt: null,
      questions: [question({ id: "a" })],
    });
    assert.equal(intake.title, "Client Questionnaire");
    assert.ok(!intake.title.includes("Digital Marketing Hub"));
  });

  test("the title never carries internal language", () => {
    for (const title of [undefined, "  ", "Social Media Questionnaire"]) {
      const intake = toPublicIntake({
        clientName: "Acme",
        title,
        status: "sent",
        submittedAt: null,
        questions: [question({ id: "a" })],
      });
      for (const banned of ["Digital Marketing Hub", "Admin", "Intake", "Preview"]) {
        assert.ok(!intake.title.includes(banned), `${title} -> ${intake.title}`);
      }
    }
  });
});

/**
 * Attribution, on a questionnaire several people share.
 *
 * The line under an answer is the only way a second contact knows somebody
 * already answered before they type over it, so what it says has to be true:
 * never our own pre-fill dressed up as theirs, and never a name we guessed.
 */
describe("who answered", () => {
  const names = new Map([["c1", "Theresa Tsoukalas"], ["c2", "Fay Poholko"]]);

  test("a first client answer reads as provided", () => {
    const at = attributionFor(
      question({
        client_answer: "leads",
        answered_by_contact_id: "c1",
        answered_at: "2026-09-24T15:31:00Z",
        answer_revision_count: 1,
      }),
      names,
    );
    assert.deepEqual(at, {
      name: "Theresa Tsoukalas",
      at: "2026-09-24T15:31:00Z",
      updated: false,
    });
  });

  test("a later change reads as updated, by whoever changed it", () => {
    const at = attributionFor(
      question({
        client_answer: "leads first",
        answered_by_contact_id: "c2",
        answered_at: "2026-09-25T16:14:00Z",
        answer_revision_count: 2,
      }),
      names,
    );
    assert.equal(at?.name, "Fay Poholko");
    assert.equal(at?.updated, true);
  });

  test("our own pre-fill is never attributed to the client", () => {
    // The field has a value, but no client has touched it. Signing a
    // colleague's name to a Web Wizards guess is a lie they can read.
    assert.equal(
      attributionFor(question({ prefill_answer: "we guessed this" }), names),
      null,
    );
  });

  test("an unanswered question has no attribution", () => {
    assert.equal(attributionFor(question(), names), null);
    assert.equal(attributionFor(question({ client_answer: "  " }), names), null);
    assert.equal(attributionFor(question({ client_answer: [] }), names), null);
  });

  test("an answer from before contacts existed names nobody", () => {
    // Preserved, not discarded, and not credited to someone who may not have
    // written it.
    const at = attributionFor(
      question({
        client_answer: "an older answer",
        answered_by_contact_id: null,
        answered_at: "2026-09-20T10:00:00Z",
        answer_revision_count: 1,
      }),
      names,
    );
    assert.equal(at?.name, null);
    assert.equal(at?.updated, false);
  });

  test("a contact removed since answering names nobody either", () => {
    const at = attributionFor(
      question({
        client_answer: "x",
        answered_by_contact_id: "deleted-contact",
        answered_at: "2026-09-24T15:31:00Z",
        answer_revision_count: 1,
      }),
      names,
    );
    assert.equal(at?.name, null);
  });

  test("the projection emits a name and never a contact id", () => {
    const intake = toPublicIntake({
      clientName: "Acme",
      status: "sent",
      submittedAt: null,
      contactNames: names,
      questions: [
        question({
          id: "q",
          client_answer: "yes",
          answered_by_contact_id: "c1",
          answered_at: "2026-09-24T15:31:00Z",
          answer_revision_count: 1,
        }),
      ],
    });
    const emitted = JSON.stringify(intake);
    assert.ok(emitted.includes("Theresa Tsoukalas"));
    assert.ok(!emitted.includes("c1"), "no contact id may reach the client");
    assert.ok(!emitted.includes("answered_by_contact_id"));
  });
});
