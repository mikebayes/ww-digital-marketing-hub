-- ---------------------------------------------------------------------------
-- Put the service-agnostic questions back in Common.
--
-- Migration 0003 put all 24 client questions on Social Media and switched
-- Common's client-facing library off to hit that number. That traded away the
-- Common + service-module architecture: an SEO or Paid Media questionnaire
-- created afterwards would have snapshotted six records, all internal, and
-- served the client an empty form.
--
-- Eighteen of the 24 are not about social media at all — business priorities,
-- audiences, differentiators, messaging, calendar, assets, contacts,
-- approvals, access confirmation. They belong to Common, where every service
-- inherits them. Six name social media in the sentence and stay where they
-- read correctly.
--
-- Wording is untouched. This moves rows between services and renames their
-- keys; not one question_text changes, so a Social Media questionnaire still
-- asks exactly the same 24 questions in exactly the same order.
--
-- Ordering survives the move because the snapshot sorts on
-- (client_step_order, sort_order) across the merged set, and those values are
-- already globally sequenced rather than per-service.
--
-- Safe to re-run.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 1. Move the eighteen, and rename them.
--
-- The sm_ prefix would be a lie on a Common question. The key is an internal
-- identifier — snapshots link by id, not by key — so renaming costs nothing
-- and stops the library reading as though Social Media owns the whole
-- questionnaire.

update question_definitions
set
  service_id = (select id from services where slug = 'common'),
  question_key = 'core_' || substring(question_key from 4)
where service_id = (select id from services where slug = 'social-media')
  and question_key in (
    -- Your Business
    'sm_priority_areas', 'sm_priority_reasons', 'sm_deprioritised_areas',
    -- Audience & Content Direction
    'sm_primary_audiences', 'sm_audience_priorities', 'sm_misunderstandings',
    'sm_differentiators', 'sm_key_messages', 'sm_content_opportunities',
    'sm_content_to_avoid',
    -- Calendar & Content Sources
    'sm_key_dates', 'sm_existing_calendar', 'sm_existing_assets',
    'sm_subject_experts',
    -- Approvals & Working Together
    'sm_primary_contact', 'sm_other_reviewers', 'sm_approval_rules',
    -- Access
    'sm_access_status'
  );

-- ---------------------------------------------------------------------------
-- 2. What stays on Social Media.
--
-- Recorded as an assertion rather than a comment, so a future edit that
-- quietly moves one of these fails the migration instead of changing what a
-- Social Media questionnaire asks.
--
--   sm_business_goals   "...you want social media to support..."
--   sm_active_channels  "Which social media channels are currently active..."
--   sm_managed_channels "Which channels do you expect Web Wizards to manage..."
--   sm_other_managers   "...posting, managing or advertising through these
--                        accounts..."
--   sm_approver         "...final approval authority for social media content?"
--   sm_access_admin     "Who currently administers your social media
--                        accounts..."
--   plus the four Community Management questions, off by default.

do $$
declare
  common_client int;
  social_client int;
begin
  /*
   * Skipped once 0005 has run. This assertion describes the shape at the end
   * of 0004 — 18 and 6 — and 0005 deliberately takes Social Media to 9. A
   * replay from an empty database runs them in order and both hold; re-running
   * this one alone afterwards would otherwise fail on a state that is correct.
   */
  if exists (
    select 1 from question_definitions where question_key = 'sm_success_measures'
  ) then
    return;
  end if;

  select count(*) into common_client
  from question_definitions d
  join services s on s.id = d.service_id
  where s.slug = 'common' and d.active and d.client_visible;

  select count(*) into social_client
  from question_definitions d
  join services s on s.id = d.service_id
  where s.slug = 'social-media'
    and d.active and d.client_visible and d.default_enabled;

  if common_client <> 18 then
    raise exception 'Common should hold 18 active client questions, found %', common_client;
  end if;

  if social_client <> 6 then
    raise exception 'Social Media should hold 6 default-on client questions, found %', social_client;
  end if;
end $$;
