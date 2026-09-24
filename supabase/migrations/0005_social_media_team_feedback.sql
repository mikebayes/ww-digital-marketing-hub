-- ---------------------------------------------------------------------------
-- Social Media questionnaire: the team's operational feedback.
--
-- Six contributions from a Social Media team member, incorporated without
-- letting the set grow back toward the 40-plus version it was trimmed from.
-- Three become standalone questions; three are merged into questions that
-- already covered most of the ground, because a near-duplicate costs the
-- client more than it tells us.
--
--   1. Success measures       -> new question       (Social Media)
--   2. Brand/style guidelines -> merged into assets (Common)
--   3. Account / Business Manager ownership
--                             -> merged into access admin (Social Media)
--   4. Approval turnaround    -> new question       (Social Media)
--   5. Other people in the process
--                             -> merged into reviewers (Common)
--   6. Regulatory/legal/compliance
--                             -> new question       (Common)
--
-- 24 default client questions becomes 27. Still six client steps: the
-- compliance question sits inside Audience & Content Direction rather than
-- opening a Risk step, which would have been a seventh.
--
-- The Common + service-module split holds at 18 Common / 9 Social Media. The
-- one move is the second Access question: "have you granted us access yet" is
-- a status we can check ourselves, so it stops being asked at all, and the
-- slot becomes a Social Media question about ownership arrangements we cannot
-- know. Do Not Ask Twice.
--
-- Nothing here touches intake_questions. Existing snapshots keep the wording
-- they were sent with.
--
-- Safe to re-run.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- MERGED (2) Brand and style guidelines, into the assets question.
--
-- A separate "do you have a brand guide?" would have been answered by whoever
-- was already listing what we can draw from. Requirement unchanged.

update question_definitions
set question_text =
  'What existing photos, video, brand guidelines, style guides or other brand/content assets can we draw from, and where are they stored?'
where question_key = 'core_existing_assets';

-- ---------------------------------------------------------------------------
-- MERGED (5) Everyone else involved in the content process.
--
-- The original asked only about review and visibility, which reads as an
-- approval question. Widening it to "involved in the content process" is what
-- catches the designer and the salesperson who turn up in week three.

update question_definitions
set
  question_text =
    'Who else needs to review, have visibility into, or otherwise be involved in the content process?',
  help_text =
    'For example: marketing team members, sales, graphic designers or other internal stakeholders.'
where question_key = 'core_other_reviewers';

-- ---------------------------------------------------------------------------
-- MERGED (3) Account and Business Manager ownership.
--
-- Named as a common cause of onboarding delay: the person who administers the
-- page is often not the person who owns the Business Manager, and finding that
-- out at kickoff costs a week.

update question_definitions
set question_text =
  'Who owns or administers each social media account and associated Business Manager, and who can grant Web Wizards the required access?'
where question_key = 'sm_access_admin';

-- ---------------------------------------------------------------------------
-- REPLACED  The second Access question.
--
-- It asked the client whether they had granted us access yet. That is an
-- internal status — we can look. Asking costs a client a question to answer
-- something we already know, which is the thing the Do Not Ask Twice principle
-- exists to stop.
--
-- The slot becomes what we genuinely cannot determine: unusual ownership or
-- restrictions. It moves to Social Media with the wording, since it is about
-- social accounts; Common stays at 18 because the compliance question below
-- takes its place there.
--
-- Updated in place rather than deactivated-and-replaced, so the library does
-- not accumulate a retired row for every refinement. Snapshots carry their own
-- text, so nothing historical shifts under them.

update question_definitions
set
  service_id = (select id from services where slug = 'social-media'),
  question_key = 'sm_access_arrangements',
  question_text =
    'Are there any unusual account-access arrangements, restrictions or ownership issues we should know about before coordinating access with your team?',
  required_mode = 'optional',
  section = 'Access'
where question_key in ('core_access_status', 'sm_access_arrangements');

-- ---------------------------------------------------------------------------
-- NEW (1, 4, 6)
--
-- sort_order places each one where it belongs in the client's reading rather
-- than at the end: 15 puts success measures directly after business goals,
-- 115 closes Audience & Content Direction, 225 follows the approval rules.

insert into question_definitions (
  service_id, section, question_key, question_text, help_text, field_type,
  default_enabled, required_mode, client_visible, client_editable,
  client_step, client_step_order, sort_order, active
)
select
  (select id from services where slug = v.service_slug),
  v.section, v.question_key, v.question_text, v.help_text, 'textarea',
  true, v.required_mode::question_required_mode, true, true,
  v.client_step, v.client_step_order, v.sort_order, true
from (values
  -- (1) How the client already judges social media. Distinct from the
  -- business-goals question: that asks what the business wants, this asks
  -- what they will look at to decide whether it is happening.
  ('social-media', 'Your Business', 'sm_success_measures',
   'How will you judge whether social media is working? For example: leads, inquiries, reach, recruiting or brand awareness.',
   'This can change over time.',
   'optional', 'Your Business', 10, 15),

  -- (6) Compliance. Inside Audience & Content Direction on purpose — a Risk
  -- & Compliance step would have made the client's questionnaire seven steps.
  ('common', 'Audience & Content Direction', 'core_compliance_requirements',
   'Does your industry or company have regulatory, legal or compliance requirements we need to follow, such as disclaimers, warranty language or claims that need substantiating?',
   null,
   'required_by_completion', 'Audience & Content Direction', 20, 115),

  -- (4) Turnaround. Standalone because a monthly content calendar is planned
  -- around it, and it is the number that decides when drafts have to be ready.
  ('social-media', 'Approvals & Working Together', 'sm_approval_turnaround',
   'What turnaround time should we plan for approvals, and how far in advance does your team need content to review it?',
   null,
   'required_by_completion', 'Approvals & Working Together', 50, 225)
) as v (
  service_slug, section, question_key, question_text, help_text,
  required_mode, client_step, client_step_order, sort_order
)
on conflict (service_id, question_key) do update set
  section = excluded.section,
  question_text = excluded.question_text,
  help_text = excluded.help_text,
  required_mode = excluded.required_mode,
  client_step = excluded.client_step,
  client_step_order = excluded.client_step_order,
  sort_order = excluded.sort_order,
  default_enabled = true,
  client_visible = true,
  active = true;

-- ---------------------------------------------------------------------------
-- The shape this migration is responsible for, asserted rather than assumed.

do $$
declare
  common_client int;
  social_client int;
  social_conditional int;
begin
  select count(*) into common_client
  from question_definitions d join services s on s.id = d.service_id
  where s.slug = 'common' and d.active and d.client_visible and d.default_enabled;

  select count(*) into social_client
  from question_definitions d join services s on s.id = d.service_id
  where s.slug = 'social-media' and d.active and d.client_visible and d.default_enabled;

  select count(*) into social_conditional
  from question_definitions d join services s on s.id = d.service_id
  where s.slug = 'social-media' and d.active and d.client_visible and not d.default_enabled;

  if common_client <> 18 then
    raise exception 'Common should hold 18 default client questions, found %', common_client;
  end if;

  if social_client <> 9 then
    raise exception 'Social Media should hold 9 default client questions, found %', social_client;
  end if;

  if social_conditional <> 4 then
    raise exception 'Community Management should be 4 and excluded, found %', social_conditional;
  end if;
end $$;
