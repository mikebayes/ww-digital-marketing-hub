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
