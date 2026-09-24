import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  authoritativeAnswer,
  canMarkComplete,
  clientQuestions,
  documentFileName,
  formatAnswer,
  groupQuestions,
  internalPreparation,
  matchesFilter,
  matchesReview,
  needsFollowUp,
  needsReview,
  parseReviewFilter,
  progress,
  questionnaireTitle,
  responseState,
  reviewCount,
  summarize,
  serviceSummary,
} from "../lib/intake/admin.ts";
import type { IntakeQuestion } from "../lib/intake/types.ts";

/**
 * The admin screens read these. The Questions tab and the Responses tab both
 * ask whether a question is answered, outstanding or finalised, and if they
 * each decided for themselves they would eventually disagree — a count in a
 * header saying one thing and the rows beneath it another.
 */

function question(overrides: Partial<IntakeQuestion> = {}): IntakeQuestion {
  return {
    id: "q1",
    intake_id: "i1",
    question_definition_id: null,
    service_id: "s1",
    section: "Business & priorities",
    question_key: "business_goals",
    question_text: "What are your goals?",
    help_text: null,
    field_type: "textarea",
    options: [],
    client_step: "Your Business",
    client_step_order: 10,
    sort_order: 1,
    included: true,
    required_mode: "required",
    client_visible: true,
    client_editable: true,
    prefill_answer: null,
    client_answer: null,
    final_answer: null,
    internal_notes: null,
    ...overrides,
  };
}

const SERVICES = [
  { slug: "common", name: "Common" },
  { slug: "social-media", name: "Social Media" },
];

describe("naming", () => {
  test("Common is never what the engagement is called", () => {
    assert.equal(serviceSummary(SERVICES), "Social Media");
  });

  test("a questionnaire with no service beyond Common says so", () => {
    assert.equal(serviceSummary([{ slug: "common", name: "Common" }]), "Common only");
  });

  test("an explicit title wins over the derived one", () => {
    assert.equal(
      questionnaireTitle({ title: "Pre-kickoff questions" }, SERVICES),
      "Pre-kickoff questions",
    );
  });

  test("a blank title is not a title", () => {
    assert.equal(
      questionnaireTitle({ title: "   " }, SERVICES),
      "Social Media Questionnaire",
    );
  });

  test("the document filename follows the convention", () => {
    assert.equal(
      documentFileName("All Weather at Home", SERVICES),
      "All-Weather-at-Home-Social-Media-Client-Intake",
    );
  });

  test("punctuation in a client name cannot break the filename", () => {
    const name = documentFileName("Bob's Roofing & Co. / West", SERVICES);
    assert.match(name, /^[A-Za-z0-9-]+$/);
    assert.ok(!name.includes("/"));
  });
});

describe("grouping", () => {
  test("groups by the step the client sees, in data order", () => {
    const groups = groupQuestions([
      question({ id: "b", client_step: "Access", client_step_order: 60 }),
      question({ id: "a", client_step: "Your Business", client_step_order: 10 }),
    ]);
    assert.deepEqual(
      groups.map((g) => g.title),
      ["Your Business", "Access"],
    );
  });

  test("internal questions collect under their section, not a client step", () => {
    const groups = groupQuestions([
      question({
        id: "i",
        client_step: null,
        client_step_order: 0,
        section: "Internal preparation",
        client_visible: false,
      }),
      question({ id: "a" }),
    ]);
    assert.equal(groups[0].title, "Internal preparation");
    assert.equal(groups[0].clientFacing, false);
    assert.equal(groups[1].clientFacing, true);
  });

  test("every question lands in exactly one group", () => {
    const questions = [
      question({ id: "a" }),
      question({ id: "b", sort_order: 2 }),
      question({ id: "c", client_step: "Access", client_step_order: 60 }),
    ];
    const total = groupQuestions(questions).reduce(
      (n, group) => n + group.questions.length,
      0,
    );
    assert.equal(total, questions.length);
  });
});

describe("where a question stands", () => {
  test("a question nobody was asked cannot be outstanding", () => {
    assert.equal(responseState(question({ included: false })), "excluded");
  });

  test("our finalised answer overrides everything else on the row", () => {
    const q = question({
      client_answer: "They said this",
      prefill_answer: "We guessed this",
      final_answer: "We are going with this",
    });
    assert.equal(responseState(q), "finalized");
    assert.equal(authoritativeAnswer(q), "We are going with this");
  });

  test("the client's answer beats what we pre-filled", () => {
    const q = question({ client_answer: "Theirs", prefill_answer: "Ours" });
    assert.equal(responseState(q), "answered");
    assert.equal(authoritativeAnswer(q), "Theirs");
  });

  test("a pre-fill with no answer is prepared, not answered", () => {
    assert.equal(responseState(question({ prefill_answer: "Ours" })), "prepared");
  });

  test("asked, included and empty is outstanding", () => {
    assert.equal(responseState(question()), "outstanding");
  });

  test("whitespace is not an answer", () => {
    assert.equal(responseState(question({ client_answer: "   " })), "outstanding");
    assert.equal(responseState(question({ client_answer: [] })), "outstanding");
  });
});

describe("needs review", () => {
  test("flags where we wrote something different from what they told us", () => {
    assert.equal(
      needsReview(
        question({ client_answer: "Facebook", final_answer: "Facebook, Instagram" }),
      ),
      true,
    );
  });

  test("accepting their answer verbatim is not a disagreement", () => {
    assert.equal(
      needsReview(question({ client_answer: "Facebook", final_answer: "Facebook" })),
      false,
    );
  });

  test("a finalised answer to a question they never answered is not a conflict", () => {
    assert.equal(needsReview(question({ final_answer: "Ours" })), false);
  });

  test("multiselect order is compared as given, not sorted", () => {
    const q = question({
      field_type: "multiselect",
      client_answer: ["a", "b"],
      final_answer: ["a", "b"],
    });
    assert.equal(needsReview(q), false);
  });
});

describe("filters", () => {
  const rows = [
    question({ id: "out" }),
    question({ id: "ans", client_answer: "yes" }),
    question({ id: "fin", client_answer: "yes", final_answer: "no" }),
    question({ id: "int", client_visible: false, client_step: null }),
    question({ id: "exc", included: false }),
  ];

  const ids = (filter: Parameters<typeof matchesFilter>[1]) =>
    rows.filter((q) => matchesFilter(q, filter)).map((q) => q.id);

  test("excluded questions are in no filter at all", () => {
    for (const filter of ["all", "outstanding", "answered", "internal"] as const) {
      assert.ok(!ids(filter).includes("exc"), filter);
    }
  });

  test("all means every included question", () => {
    assert.deepEqual(ids("all"), ["out", "ans", "fin", "int"]);
  });

  test("answered covers finalised too", () => {
    assert.deepEqual(ids("answered"), ["ans", "fin"]);
  });

  test("outstanding is what nobody has answered", () => {
    assert.deepEqual(ids("outstanding"), ["out", "int"]);
  });

  test("needs review is only the disagreement", () => {
    assert.deepEqual(ids("review"), ["fin"]);
  });

  test("internal is the preparation set", () => {
    assert.deepEqual(ids("internal"), ["int"]);
  });
});

describe("counts", () => {
  test("included and excluded always account for every question", () => {
    const rows = [
      question({ id: "a" }),
      question({ id: "b", included: false }),
      question({ id: "c", client_visible: false }),
    ];
    const counts = progress(rows);
    assert.equal(counts.total, 3);
    assert.equal(counts.included + counts.excluded, counts.total);
    assert.equal(counts.clientFacing + counts.internalOnly, counts.included);
  });

  test("answered and outstanding do not double count", () => {
    const rows = [
      question({ id: "a", client_answer: "x" }),
      question({ id: "b" }),
      question({ id: "c", prefill_answer: "y" }),
    ];
    const counts = progress(rows);
    assert.equal(counts.answered, 1);
    assert.equal(counts.outstanding, 1);
    assert.equal(counts.prefilled, 1);
  });
});

describe("formatting an answer", () => {
  test("a multiselect reads as a list", () => {
    assert.equal(formatAnswer(["Facebook", "Instagram"]), "Facebook, Instagram");
  });

  test("a boolean reads as a word", () => {
    assert.equal(formatAnswer(true), "Yes");
    assert.equal(formatAnswer(false), "No");
  });

  test("blank stays blank rather than becoming 'null'", () => {
    assert.equal(formatAnswer(null), "");
    assert.equal(formatAnswer("  "), "");
    assert.equal(formatAnswer([]), "");
  });
});

describe("client questions and internal preparation are different things", () => {
  const rows = [
    question({ id: "c1" }),
    question({ id: "c2", included: false }),
    question({ id: "i1", client_visible: false, client_step: null }),
  ];

  test("the split is by who may see it, not by section name", () => {
    assert.deepEqual(clientQuestions(rows).map((q) => q.id), ["c1", "c2"]);
    assert.deepEqual(internalPreparation(rows).map((q) => q.id), ["i1"]);
  });

  test("the headline count is included client questions only", () => {
    const counts = summarize(rows);
    assert.equal(counts.clientQuestions, 1);
    assert.equal(counts.excluded, 1);
    assert.equal(counts.internalPreparation, 1);
  });

  test("internal preparation is never counted as a client question", () => {
    const counts = summarize([
      question({ id: "i", client_visible: false, client_step: null }),
    ]);
    assert.equal(counts.clientQuestions, 0);
    assert.equal(counts.internalPreparation, 1);
  });
});

describe("needs follow-up before completion", () => {
  const rbc = (over = {}) =>
    question({ required_mode: "required_by_completion", ...over });

  test("a required-by-completion question nobody has answered", () => {
    assert.equal(needsFollowUp([rbc({ id: "a" })]).length, 1);
  });

  test("the client answering resolves it", () => {
    assert.equal(needsFollowUp([rbc({ client_answer: "yes" })]).length, 0);
  });

  test("our finalised answer resolves it too", () => {
    assert.equal(needsFollowUp([rbc({ final_answer: "we decided" })]).length, 0);
  });

  test("a prefill does NOT resolve it", () => {
    // A prefill is what we guessed. The whole point of the mark is that
    // somebody confirms it.
    assert.equal(needsFollowUp([rbc({ prefill_answer: "we guessed" })]).length, 1);
  });

  test("optional and plain-required questions are not follow-up", () => {
    assert.equal(needsFollowUp([question({ required_mode: "optional" })]).length, 0);
    assert.equal(needsFollowUp([question({ required_mode: "required" })]).length, 0);
  });

  test("excluded questions are not owed to anyone", () => {
    assert.equal(needsFollowUp([rbc({ included: false })]).length, 0);
  });

  test("internal preparation is never client follow-up", () => {
    assert.equal(
      needsFollowUp([rbc({ client_visible: false, client_step: null })]).length,
      0,
    );
  });
});

describe("the completion rule", () => {
  test("complete is refused while a required-by-completion question is open", () => {
    assert.equal(
      canMarkComplete([question({ required_mode: "required_by_completion" })]),
      false,
    );
  });

  test("complete is allowed once each one is resolved", () => {
    assert.equal(
      canMarkComplete([
        question({ required_mode: "required_by_completion", client_answer: "a" }),
        question({ required_mode: "required_by_completion", final_answer: "b" }),
        question({ required_mode: "optional" }),
      ]),
      true,
    );
  });

  test("an empty questionnaire is completable", () => {
    assert.equal(canMarkComplete([]), true);
  });
});

describe("review filters", () => {
  const rows = [
    question({ id: "asked" }),
    question({ id: "answered", client_answer: "yes" }),
    question({ id: "final", client_answer: "yes", final_answer: "no" }),
    question({ id: "owed", required_mode: "required_by_completion" }),
    question({ id: "internal", client_visible: false, client_step: null }),
    question({ id: "excluded", included: false }),
  ];
  const ids = (f: Parameters<typeof matchesReview>[1]) =>
    rows.filter((q) => matchesReview(q, f)).map((q) => q.id);

  test("the default view is the client's questionnaire", () => {
    assert.equal(parseReviewFilter(undefined), "client");
    assert.equal(parseReviewFilter("nonsense"), "client");
  });

  test("client responses means everything we asked them, answered or not", () => {
    assert.deepEqual(ids("client"), ["asked", "answered", "final", "owed"]);
  });

  test("internal preparation is its own view, never mixed into client", () => {
    assert.deepEqual(ids("internal"), ["internal"]);
    assert.ok(!ids("client").includes("internal"));
  });

  test("follow-up is only what we owe before completion", () => {
    assert.deepEqual(ids("follow-up"), ["owed"]);
  });

  test("finalised is what we wrote our own answer to", () => {
    assert.deepEqual(ids("finalised"), ["final"]);
  });

  test("excluded questions appear in no view", () => {
    for (const f of ["client", "follow-up", "finalised", "internal"] as const) {
      assert.ok(!ids(f).includes("excluded"), f);
    }
  });

  test("counts agree with what the view shows", () => {
    for (const f of ["client", "follow-up", "finalised", "internal"] as const) {
      assert.equal(reviewCount(rows, f), ids(f).length, f);
    }
  });
});
