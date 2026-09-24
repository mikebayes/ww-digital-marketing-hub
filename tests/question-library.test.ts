import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

/**
 * The Common + service-module architecture, pinned.
 *
 * Common carries the questions every engagement asks — priorities, audiences,
 * messaging, calendar, assets, contacts, approvals. A service module carries
 * only what is specific to it. That is what lets an SEO questionnaire exist
 * without rewriting the library.
 *
 * This is here because it was already lost once: migration 0003 moved all 24
 * client questions onto Social Media and deactivated Common's client set to
 * reach an exact count, and the first SEO questionnaire would have served the
 * client an empty form. Nothing in the test suite noticed.
 *
 * Reads the migrations rather than the database so it runs anywhere, and so a
 * change to the intended shape has to be written down before it passes.
 */

const migration = (name: string) =>
  readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), "utf8");

/** Keys the split moved to Common, by the question they carry. */
const COMMON_KEYS = [
  "core_priority_areas",
  "core_priority_reasons",
  "core_deprioritised_areas",
  "core_primary_audiences",
  "core_audience_priorities",
  "core_misunderstandings",
  "core_differentiators",
  "core_key_messages",
  "core_content_opportunities",
  "core_content_to_avoid",
  "core_key_dates",
  "core_existing_calendar",
  "core_existing_assets",
  "core_subject_experts",
  "core_primary_contact",
  "core_other_reviewers",
  "core_approval_rules",
  "core_access_status",
];

/** Questions that name social media in the sentence and cannot be Common. */
const SOCIAL_KEYS = [
  "sm_business_goals",
  "sm_active_channels",
  "sm_managed_channels",
  "sm_other_managers",
  "sm_approver",
  "sm_access_admin",
];

const CONDITIONAL_KEYS = [
  "sm_community_owner",
  "sm_community_direct_response",
  "sm_community_escalation",
  "sm_community_escalation_contact",
];

describe("the Common module still carries the shared questions", async () => {
  const sql = await migration("0004_restore_common_module.sql");

  test("eighteen questions move to Common", () => {
    for (const key of COMMON_KEYS) {
      assert.ok(
        sql.includes(`'${key.replace("core_", "sm_")}'`),
        `${key} should be moved to Common by 0004`,
      );
    }
  });

  test("the move renames them off the social prefix", () => {
    assert.match(sql, /question_key = 'core_' \|\| substring\(question_key from 4\)/);
  });

  test("the migration asserts the resulting shape", () => {
    // A future edit that moves one of these has to fail loudly rather than
    // quietly change what a Social Media questionnaire asks.
    assert.match(sql, /Common should hold 18 active client questions/);
    assert.match(sql, /Social Media should hold 6 default-on client questions/);
  });

  test("nothing in the move touches question wording", () => {
    assert.ok(
      !/question_text\s*=/.test(sql),
      "0004 must not rewrite any question text",
    );
  });
});

describe("the service module carries only what is service-specific", async () => {
  const sql = await migration("0004_restore_common_module.sql");

  /** The exact key list the move applies to, read out of the migration. */
  const moved = (() => {
    const start = sql.indexOf("and question_key in (");
    const list = sql.slice(start, sql.indexOf(");", start));
    return [...list.matchAll(/'([a-z_]+)'/g)].map((match) => match[1]);
  })();

  test("the move is exactly the eighteen shared questions", () => {
    assert.deepEqual(
      [...moved].sort(),
      COMMON_KEYS.map((key) => key.replace("core_", "sm_")).sort(),
    );
  });

  test("the questions that name social media stay on Social Media", () => {
    for (const key of SOCIAL_KEYS) {
      assert.ok(!moved.includes(key), `${key} must not be moved to Common`);
    }
  });

  test("Community Management is not swept into Common either", () => {
    for (const key of CONDITIONAL_KEYS) {
      assert.ok(!moved.includes(key), `${key} must not be moved to Common`);
    }
  });

  test("Common and Social Media claim no key twice", () => {
    const overlap = COMMON_KEYS.filter((key) =>
      SOCIAL_KEYS.includes(key.replace("core_", "sm_")),
    );
    assert.deepEqual(overlap, []);
  });

  test("the eight-and-six split accounts for all twenty-four", () => {
    assert.equal(COMMON_KEYS.length + SOCIAL_KEYS.length, 24);
  });

  test("Community Management is available but not part of the twenty-four", () => {
    assert.equal(CONDITIONAL_KEYS.length, 4);
    for (const key of CONDITIONAL_KEYS) {
      assert.ok(!COMMON_KEYS.includes(key) && !SOCIAL_KEYS.includes(key));
    }
  });
});

describe("no service is left with an empty client questionnaire", async () => {
  const retire = await migration("0003_social_media_question_set.sql");
  const restore = await migration("0004_restore_common_module.sql");

  test("0003 retires the old client library", () => {
    // Kept as the record of what happened: 0003 is why Common was empty.
    assert.match(retire, /set active = false/);
  });

  test("0004 is what puts Common back, and runs after it", () => {
    assert.ok(restore.includes("slug = 'common'"));
    assert.ok(
      restore.includes("18"),
      "0004 should assert Common is not left empty",
    );
  });

  test("the conditional questions are seeded off", () => {
    for (const key of CONDITIONAL_KEYS) {
      const row = retire.slice(retire.indexOf(`'${key}'`));
      assert.match(
        row.slice(0, 300),
        /false, 'optional'/,
        `${key} must default to excluded`,
      );
    }
  });
});

/**
 * The Social Media team's feedback, pinned.
 *
 * Six contributions were incorporated: three as new questions, three merged
 * into questions that already covered most of the ground. A merge is the
 * easiest kind of change to lose — the contribution has no row of its own, so
 * nothing fails if the wording quietly reverts. These assert the substance.
 */
describe("the team's six contributions survive", async () => {
  const sql = await migration("0005_social_media_team_feedback.sql");

  test("(1) success measures is a standalone question", () => {
    assert.match(sql, /'sm_success_measures'/);
    assert.match(sql, /How will you judge whether social media is working\?/);
    assert.match(sql, /This can change over time\./);
  });

  test("(2) brand and style guidelines are inside the assets question", () => {
    // Merged rather than added: a separate "do you have a brand guide?" is
    // answered by whoever is already listing what we can draw from.
    assert.match(sql, /brand guidelines, style guides/);
    assert.match(sql, /question_key = 'core_existing_assets'/);
    assert.ok(!/'core_brand_guidelines'/.test(sql), "must not become its own question");
  });

  test("(3) Business Manager ownership is inside the access question", () => {
    assert.match(sql, /associated Business Manager/);
    assert.match(sql, /question_key = 'sm_access_admin'/);
  });

  test("(4) approval turnaround is a standalone question", () => {
    assert.match(sql, /'sm_approval_turnaround'/);
    assert.match(sql, /how far in advance does your team need content to review it\?/);
  });

  test("(5) everyone involved in the process is inside the reviewers question", () => {
    assert.match(sql, /otherwise be involved in the content process/);
    assert.match(sql, /question_key = 'core_other_reviewers'/);
    assert.match(sql, /graphic designers or other internal stakeholders/);
  });

  test("(6) compliance is a standalone Common question", () => {
    assert.match(sql, /'core_compliance_requirements'/);
    assert.match(sql, /regulatory, legal or compliance requirements/);
    assert.match(sql, /'common', 'Audience & Content Direction'/);
  });

  test("compliance does not open a seventh client step", () => {
    // A Risk & Compliance step would have made the client's questionnaire
    // seven steps. It lives inside Audience & Content Direction instead.
    assert.ok(!/Risk & Compliance/.test(sql));
    assert.ok(!/client_step_order, 70/.test(sql));
  });
});

describe("the refined set stays the size it was trimmed to", async () => {
  const sql = await migration("0005_social_media_team_feedback.sql");

  test("the split is asserted by the migration itself", () => {
    assert.match(sql, /Common should hold 18 default client questions/);
    assert.match(sql, /Social Media should hold 9 default client questions/);
    assert.match(sql, /Community Management should be 4 and excluded/);
  });

  test("Common is not deactivated again", () => {
    assert.ok(
      !/set active = false/.test(sql),
      "0005 must not retire anything; that is how Common was lost the first time",
    );
  });

  test("the second Access question stops asking what we can check ourselves", () => {
    // "Have you granted us access yet" is an internal status. Do Not Ask Twice.
    assert.match(sql, /'core_access_status', 'sm_access_arrangements'/);
    assert.match(sql, /unusual account-access arrangements/);
    assert.ok(!/Has Web Wizards already been granted/.test(sql));
  });

  test("the conditional four are untouched", () => {
    for (const key of CONDITIONAL_KEYS) {
      assert.ok(!sql.includes(key), `${key} must not be modified by 0005`);
    }
  });
});
