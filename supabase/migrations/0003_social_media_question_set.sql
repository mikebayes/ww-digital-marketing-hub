-- ---------------------------------------------------------------------------
-- The trimmed Social Media client questionnaire.
--
-- The old set asked 44 client questions across Common and Social Media and
-- tried to produce the strategy by interview. It does not: the questionnaire
-- collects what only the client can tell us, kickoff closes the gaps, and the
-- strategy is built in the strategy session. So the client-facing set is now
-- 24 questions, plus four Community Management questions that are available
-- but off unless that work is in scope.
--
-- WHAT THIS DOES NOT TOUCH: intake_questions. Every questionnaire already
-- created keeps the exact wording it was sent with — that snapshot is the
-- record of what a client was asked and what they were answering when they
-- agreed to something, and no library edit may reach back into it.
--
-- Obsolete definitions are deactivated rather than deleted. snapshotQuestions
-- filters on active, so a deactivated row is never copied into a new
-- questionnaire, while intake_questions.question_definition_id still resolves
-- for anything asked before today.
--
-- Safe to re-run.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 1. Retire the old client-facing library.
--
-- Scoped to rows whose key is not one of the new ones, so re-running this
-- migration after the inserts below does not switch off what it just added.
-- The nine internal preparation fields are client_visible = false and are
-- deliberately untouched: they are not part of what changed.

update question_definitions
set active = false
where client_visible = true
  and question_key not like 'sm\_%'
  and service_id in (
    select id from services where slug in ('common', 'social-media')
  );

-- ---------------------------------------------------------------------------
-- 2. The new set.
--
-- required_by_completion is the requirement that matters here. It never blocks
-- a client from submitting — they can leave anything they are unsure of and we
-- settle it at kickoff — but a questionnaire cannot be marked complete while
-- one is unresolved.

insert into question_definitions (
  service_id, section, question_key, question_text, field_type,
  default_enabled, required_mode, client_visible, client_editable,
  client_step, client_step_order, sort_order, active
)
select
  (select id from services where slug = 'social-media'),
  v.section, v.question_key, v.question_text, v.field_type::question_field_type,
  v.default_enabled, v.required_mode::question_required_mode, true, true,
  v.client_step, v.client_step_order, v.sort_order, true
from (values
  -- 1. Your Business ------------------------------------------------------
  ('Your Business', 'sm_business_goals',
   'What are the main business goals you want social media to support over the next 6-12 months?',
   'textarea', true, 'required_by_completion', 'Your Business', 10, 10),
  ('Your Business', 'sm_priority_areas',
   'Which products, services, locations or areas of the business should receive the most attention?',
   'textarea', true, 'required_by_completion', 'Your Business', 10, 20),
  ('Your Business', 'sm_priority_reasons',
   'Why are those priorities important right now?',
   'textarea', true, 'optional', 'Your Business', 10, 30),
  ('Your Business', 'sm_deprioritised_areas',
   'Are there products, services or areas you do not want us emphasizing?',
   'textarea', true, 'optional', 'Your Business', 10, 40),

  -- 2. Audience & Content Direction ---------------------------------------
  ('Audience & Content Direction', 'sm_primary_audiences',
   'Who are the primary audiences or customer groups we should be speaking to?',
   'textarea', true, 'required_by_completion', 'Audience & Content Direction', 20, 50),
  ('Audience & Content Direction', 'sm_audience_priorities',
   'What matters most to those audiences when choosing a company like yours?',
   'textarea', true, 'optional', 'Audience & Content Direction', 20, 60),
  ('Audience & Content Direction', 'sm_misunderstandings',
   'What do customers commonly misunderstand about your company, products or services?',
   'textarea', true, 'optional', 'Audience & Content Direction', 20, 70),
  ('Audience & Content Direction', 'sm_differentiators',
   'What makes your company, products or services different from the alternatives customers consider?',
   'textarea', true, 'required_by_completion', 'Audience & Content Direction', 20, 80),
  ('Audience & Content Direction', 'sm_key_messages',
   'What are the most important things you want customers to understand about your business?',
   'textarea', true, 'required_by_completion', 'Audience & Content Direction', 20, 90),
  ('Audience & Content Direction', 'sm_content_opportunities',
   'What topics, stories or areas of the business would you like us to talk about more often?',
   'textarea', true, 'optional', 'Audience & Content Direction', 20, 100),
  ('Audience & Content Direction', 'sm_content_to_avoid',
   'Are there messages, claims, topics or types of content we should avoid or handle carefully?',
   'textarea', true, 'required_by_completion', 'Audience & Content Direction', 20, 110),

  -- 3. Calendar & Content Sources -----------------------------------------
  ('Calendar & Content Sources', 'sm_key_dates',
   'Are there important seasonal periods, promotions, launches, events or company milestones we should know about?',
   'textarea', true, 'required_by_completion', 'Calendar & Content Sources', 30, 120),
  ('Calendar & Content Sources', 'sm_existing_calendar',
   'Do you already have a marketing, promotional or event calendar we can work from?',
   'textarea', true, 'optional', 'Calendar & Content Sources', 30, 130),
  ('Calendar & Content Sources', 'sm_existing_assets',
   'What existing photos, video, brand assets or other content can we draw from, and where are they stored?',
   'textarea', true, 'required_by_completion', 'Calendar & Content Sources', 30, 140),
  ('Calendar & Content Sources', 'sm_subject_experts',
   'Who on your team can provide subject-matter expertise or help us access people, projects, locations or other content opportunities?',
   'textarea', true, 'optional', 'Calendar & Content Sources', 30, 150),

  -- 4. Social Channels ------------------------------------------------------
  ('Social Channels', 'sm_active_channels',
   'Which social media channels are currently active for your organization?',
   'textarea', true, 'required_by_completion', 'Social Channels', 40, 160),
  ('Social Channels', 'sm_managed_channels',
   'Which channels do you expect Web Wizards to manage as part of this engagement?',
   'textarea', true, 'required_by_completion', 'Social Channels', 40, 170),
  ('Social Channels', 'sm_other_managers',
   'Is anyone else currently posting, managing or advertising through these accounts that we should coordinate with?',
   'textarea', true, 'required_by_completion', 'Social Channels', 40, 180),

  -- 5. Approvals & Working Together -----------------------------------------
  ('Approvals & Working Together', 'sm_primary_contact',
   'Who should be our primary day-to-day contact?',
   'text', true, 'required_by_completion', 'Approvals & Working Together', 50, 190),
  ('Approvals & Working Together', 'sm_approver',
   'Who has final approval authority for social media content?',
   'text', true, 'required_by_completion', 'Approvals & Working Together', 50, 200),
  ('Approvals & Working Together', 'sm_other_reviewers',
   'Does anyone else need to review or have visibility into content before it is published?',
   'textarea', true, 'optional', 'Approvals & Working Together', 50, 210),
  ('Approvals & Working Together', 'sm_approval_rules',
   'Are there types of content that can be published without individual approval, or anything that should always require explicit approval?',
   'textarea', true, 'required_by_completion', 'Approvals & Working Together', 50, 220),

  -- 6. Access ---------------------------------------------------------------
  ('Access', 'sm_access_admin',
   'Who currently administers your social media accounts and can grant Web Wizards the required access?',
   'textarea', true, 'required_by_completion', 'Access', 60, 230),
  ('Access', 'sm_access_status',
   'Has Web Wizards already been granted the required access? If not, is there anything we should know before we coordinate access with your team?',
   'textarea', true, 'required_by_completion', 'Access', 60, 240),

  -- Conditional: Community Management ---------------------------------------
  --
  -- Off by default. These only make sense when community management is in
  -- scope, and asking them otherwise sets an expectation we have not sold.
  ('Community management', 'sm_community_owner',
   'Who currently monitors comments and direct messages?',
   'textarea', false, 'optional', 'Approvals & Working Together', 50, 250),
  ('Community management', 'sm_community_direct_response',
   'What types of questions or comments can Web Wizards respond to directly?',
   'textarea', false, 'optional', 'Approvals & Working Together', 50, 260),
  ('Community management', 'sm_community_escalation',
   'What types of issues should always be escalated to your team?',
   'textarea', false, 'optional', 'Approvals & Working Together', 50, 270),
  ('Community management', 'sm_community_escalation_contact',
   'Who should receive those escalations?',
   'text', false, 'optional', 'Approvals & Working Together', 50, 280)
) as v (
  section, question_key, question_text, field_type,
  default_enabled, required_mode, client_step, client_step_order, sort_order
)
on conflict (service_id, question_key) do update set
  section = excluded.section,
  question_text = excluded.question_text,
  field_type = excluded.field_type,
  default_enabled = excluded.default_enabled,
  required_mode = excluded.required_mode,
  client_visible = excluded.client_visible,
  client_editable = excluded.client_editable,
  client_step = excluded.client_step,
  client_step_order = excluded.client_step_order,
  sort_order = excluded.sort_order,
  active = true;
