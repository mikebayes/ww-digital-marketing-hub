-- ---------------------------------------------------------------------------
-- The Access step, rewritten.
--
-- The two Access questions asked the client to describe an access situation we
-- already understand, and one of them asked which accounts exist at all. What
-- we actually need from them is a person to coordinate with, and a warning
-- about anything unusual. Everything else — which channels are in scope,
-- whether we already hold access — is ours to know.
--
-- Adds a step-level introduction, which the questionnaire had nowhere to put.
-- The Access step now opens by saying what we are going to do and who we will
-- do it with, before asking anything. Nullable on both tables, so every
-- existing question and every existing snapshot is unaffected.
--
-- Does not touch intake_questions wording. Historical snapshots keep what they
-- were sent with; the All Weather draft is re-snapshotted separately and only
-- after it is confirmed to hold no answers.
--
-- Safe to re-run.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 1. Somewhere for a step to introduce itself.
--
-- Carried on the question rather than in a steps table because steps are not
-- rows — they are produced by grouping on client_step, so a service composes
-- its own without any schema knowing about it. buildSteps() takes the intro
-- from the first question in the step that has one.

alter table question_definitions add column if not exists step_intro text;
alter table intake_questions add column if not exists step_intro text;

comment on column question_definitions.step_intro is
  'Shown once above the step this question opens. Null on every other question in the step.';

-- ---------------------------------------------------------------------------
-- 2. Question 1 — who to coordinate with.
--
-- The key changes with the meaning: this is no longer "who administers the
-- accounts" but "who do we talk to about getting access". Requirement is
-- unchanged at required_by_completion; we cannot finish onboarding without it.
--
-- The channel names are deliberate and come from the engagement. Worth knowing
-- when a second Social Media client arrives: this is master-library wording,
-- so it will name Facebook, Instagram and LinkedIn for them too. Editing the
-- snapshot per client is a one-line change on the Questions tab.

update question_definitions
set
  question_key = 'sm_access_contact',
  question_text =
    'Who should we contact to arrange access to Facebook, Instagram and LinkedIn?',
  help_text =
    'Please provide the name and email address of the person who manages these accounts. If different people manage different channels, please list the appropriate contact for each.',
  step_intro =
    'As part of this engagement, Web Wizards will be managing Facebook, Instagram and LinkedIn with your team.'
    || E'\n\n' ||
    'We will need the appropriate administrative or delegated access to each of these channels. We will coordinate the setup directly with the person on your team who manages these accounts.',
  required_mode = 'required_by_completion',
  section = 'Access'
where question_key in ('sm_access_admin', 'sm_access_contact');

-- ---------------------------------------------------------------------------
-- 3. Question 2 — anything we should know before we start.
--
-- Still the only thing here we genuinely cannot determine ourselves, and still
-- optional: a client with nothing unusual to report should be able to move on.

update question_definitions
set
  question_text =
    'Are there any known account ownership, access or administrative issues we should be aware of before we get started?',
  help_text = null,
  required_mode = 'optional',
  section = 'Access'
where question_key = 'sm_access_arrangements';

-- ---------------------------------------------------------------------------
-- The Access step, asserted. Two questions, one intro, no counts moved.

do $$
declare
  access_questions int;
  intros int;
  social_client int;
begin
  select count(*) into access_questions
  from question_definitions
  where active and client_visible and default_enabled and client_step = 'Access';

  select count(*) into intros
  from question_definitions
  where active and client_step = 'Access' and step_intro is not null;

  select count(*) into social_client
  from question_definitions d join services s on s.id = d.service_id
  where s.slug = 'social-media' and d.active and d.client_visible and d.default_enabled;

  if access_questions <> 2 then
    raise exception 'Access should hold 2 client questions, found %', access_questions;
  end if;

  if intros <> 1 then
    raise exception 'Access should carry exactly 1 step intro, found %', intros;
  end if;

  if social_client <> 9 then
    raise exception 'Social Media should still hold 9 default client questions, found %', social_client;
  end if;
end $$;
