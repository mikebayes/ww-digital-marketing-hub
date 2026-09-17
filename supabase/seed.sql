-- Client Intakes — seed data.
--
-- Safe to re-run: every insert is ON CONFLICT DO NOTHING, so edits made to the
-- question library through the app or the Supabase table editor survive a
-- second run of this file. To deliberately reset a question, delete the row
-- first, then re-run.
--
-- sort_order is global per service rather than per section, because a client
-- step can draw questions from more than one section and from more than one
-- service. Common questions are numbered below the service questions so they
-- lead within any step they share.

-- ---------------------------------------------------------------------------
-- Services
-- ---------------------------------------------------------------------------

insert into services (name, slug, active, sort_order) values
  ('Common',       'common',       true, 0),
  ('Social Media', 'social-media', true, 10),
  ('SEO',          'seo',          true, 20),
  ('Paid Media',   'paid-media',   true, 30)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Common questions
-- ---------------------------------------------------------------------------

insert into question_definitions (
  service_id, section, question_key, question_text, field_type, options,
  default_enabled, required_mode, allow_prefill, client_visible, client_editable,
  client_step, client_step_order, sort_order
)
select
  (select id from services where slug = 'common'),
  v.section, v.question_key, v.question_text, v.field_type::question_field_type,
  coalesce(v.options, '[]'::jsonb),
  true, v.required_mode::question_required_mode, true, true, true,
  v.client_step, v.client_step_order, v.sort_order
from (values
  -- Business & priorities ---------------------------------------------------
  ('Business & priorities', 'business_goals',
   'What are the main business goals you want this work to support over the next 6–12 months?',
   'textarea', null::jsonb, 'required_by_completion', 'Your Business', 10, 100),
  ('Business & priorities', 'priority_offerings',
   'Which products, services, locations or business areas should receive the most attention?',
   'textarea', null, 'required_by_completion', 'Your Business', 10, 110),
  ('Business & priorities', 'priority_reason',
   'Why are those priorities important right now?',
   'textarea', null, 'optional', 'Your Business', 10, 120),
  ('Business & priorities', 'deprioritized_offerings',
   'Are there products, services or areas you do not want us emphasizing?',
   'textarea', null, 'optional', 'Your Business', 10, 130),
  ('Business & priorities', 'geographic_markets',
   'What geographic markets are most important to your business?',
   'textarea', null, 'optional', 'Your Business', 10, 140),

  -- Messaging ---------------------------------------------------------------
  ('Messaging', 'key_differentiators',
   'What makes your company, products or services meaningfully different from the alternatives customers consider?',
   'textarea', null, 'required_by_completion', 'Your Business', 10, 150),
  ('Messaging', 'core_messages',
   'What are the most important things you want customers to understand about your business?',
   'textarea', null, 'optional', 'Your Business', 10, 160),
  ('Messaging', 'restricted_topics',
   'Are there messages, claims, topics or subjects we should avoid?',
   'textarea', null, 'optional', 'Your Business', 10, 170),
  ('Messaging', 'compliance_constraints',
   'Are there legal, regulatory, brand or compliance requirements we need to follow?',
   'textarea', null, 'optional', 'Your Business', 10, 180),

  -- Audience ----------------------------------------------------------------
  ('Audience', 'primary_audience',
   'Who are the primary audiences or customer groups we should be speaking to?',
   'textarea', null, 'required_by_completion', 'Audience & Content Direction', 20, 200),
  ('Audience', 'audience_decision_factors',
   'What matters most to these customers when choosing a company like yours?',
   'textarea', null, 'optional', 'Audience & Content Direction', 20, 210),
  ('Audience', 'secondary_audience',
   'Are there any secondary audiences we should keep in mind?',
   'textarea', null, 'optional', 'Audience & Content Direction', 20, 220),
  ('Audience', 'customer_misunderstandings',
   'What do customers commonly misunderstand about your company, products or services?',
   'textarea', null, 'optional', 'Audience & Content Direction', 20, 230),

  -- Calendar ----------------------------------------------------------------
  ('Calendar', 'seasonality',
   'Are there important seasonal periods in your business that we should know about?',
   'textarea', null, 'optional', 'Calendar & Content Sources', 30, 300),
  ('Calendar', 'upcoming_activity',
   'What major promotions, launches, events, campaigns or company milestones are already planned?',
   'textarea', null, 'required_by_completion', 'Calendar & Content Sources', 30, 310),
  ('Calendar', 'marketing_calendar',
   'Do you already have a marketing, promotional or event calendar we can work from?',
   'textarea', null, 'optional', 'Calendar & Content Sources', 30, 320),

  -- Contacts ----------------------------------------------------------------
  ('Contacts', 'primary_contact',
   'Who should be our primary working contact?',
   'text', null, 'required_by_completion', 'Approvals & Working Together', 50, 400),
  ('Contacts', 'approval_contact',
   'Who has final approval authority for this work?',
   'text', null, 'required_by_completion', 'Approvals & Working Together', 50, 410),
  ('Contacts', 'other_stakeholders',
   'Are there other people who should be involved or kept informed?',
   'textarea', null, 'optional', 'Approvals & Working Together', 50, 420),
  ('Contacts', 'urgent_contact',
   'Who should we contact if something urgent or sensitive comes up?',
   'text', null, 'optional', 'Approvals & Working Together', 50, 430),

  -- Final -------------------------------------------------------------------
  ('Final', 'additional_context',
   'Is there anything else we should know that would help us do better work for your organization?',
   'textarea', null, 'optional', 'Access', 60, 900)
) as v (section, question_key, question_text, field_type, options,
        required_mode, client_step, client_step_order, sort_order)
on conflict (service_id, question_key) do nothing;

-- Internal preparation. client_visible = false keeps these off the client
-- questionnaire; the public projection drops them again by filter and never
-- selects internal_notes at all.
insert into question_definitions (
  service_id, section, question_key, question_text, field_type,
  default_enabled, required_mode, allow_prefill, client_visible, client_editable,
  client_step, client_step_order, sort_order
)
select
  (select id from services where slug = 'common'),
  'Internal preparation', v.question_key, v.question_text, 'textarea',
  true, 'optional', true, false, false,
  null, 0, v.sort_order
from (values
  ('internal_proposal_summary',     'Proposal summary',            1000),
  ('internal_handoff_context',      'Sales and handoff context',   1010),
  ('internal_brand_observations',   'Brand observations',          1020),
  ('internal_known_assets',         'Known assets',                1030),
  ('internal_access_notes',         'Access notes',                1040),
  ('internal_kickoff_topics',       'Kickoff topics',              1050)
) as v (question_key, question_text, sort_order)
on conflict (service_id, question_key) do nothing;

-- ---------------------------------------------------------------------------
-- Social Media questions
-- ---------------------------------------------------------------------------

insert into question_definitions (
  service_id, section, question_key, question_text, field_type, options,
  default_enabled, required_mode, allow_prefill, client_visible, client_editable,
  client_step, client_step_order, sort_order
)
select
  (select id from services where slug = 'social-media'),
  v.section, v.question_key, v.question_text, v.field_type::question_field_type,
  coalesce(v.options, '[]'::jsonb),
  v.default_enabled, v.required_mode::question_required_mode, true, true, true,
  v.client_step, v.client_step_order, v.sort_order
from (values
  -- Content direction -------------------------------------------------------
  ('Content direction', 'social_priority_topics',
   'What topics, stories or areas of your business should we talk about most often?',
   'textarea', null::jsonb, true, 'required_by_completion', 'Audience & Content Direction', 20, 500),
  ('Content direction', 'social_customer_questions',
   'What questions do customers frequently ask your team?',
   'textarea', null, true, 'optional', 'Audience & Content Direction', 20, 510),
  ('Content direction', 'social_content_preferences',
   'Are there particular types of content you would like to see more of?',
   'multiselect',
   '["Educational","Product / Service","Projects / Work","Behind the Scenes","Staff / Culture","Customer Stories","Community","Thought Leadership","Promotional","Video / Reels","Other"]'::jsonb,
   true, 'optional', 'Audience & Content Direction', 20, 520),
  ('Content direction', 'social_reference_accounts',
   'Are there social accounts or examples of content you particularly like?',
   'textarea', null, true, 'optional', 'Audience & Content Direction', 20, 530),
  ('Content direction', 'social_disliked_examples',
   'Are there types of social content or styles that you definitely do not want us to use?',
   'textarea', null, true, 'optional', 'Audience & Content Direction', 20, 540),
  ('Content direction', 'social_tone_notes',
   'Is there anything about your desired tone or personality that would not already be obvious from your existing brand materials and social channels?',
   'textarea', null, true, 'optional', 'Audience & Content Direction', 20, 550),

  -- Content sources ---------------------------------------------------------
  ('Content sources', 'social_existing_assets',
   'What existing content can we draw from?',
   'multiselect',
   '["Photography","Video","Product Information","Brochures","Case Studies","Testimonials","Articles","Previous Campaigns","Brand Assets","Other"]'::jsonb,
   true, 'optional', 'Calendar & Content Sources', 30, 600),
  ('Content sources', 'social_asset_location',
   'Where are these assets currently stored?',
   'textarea', null, true, 'required_by_completion', 'Calendar & Content Sources', 30, 610),
  ('Content sources', 'social_subject_experts',
   'Who on your team can provide product or subject-matter expertise when needed?',
   'textarea', null, true, 'optional', 'Calendar & Content Sources', 30, 620),
  ('Content sources', 'social_feature_opportunities',
   'Are there employees, customers, projects, locations or facilities that could be featured in content?',
   'textarea', null, true, 'optional', 'Calendar & Content Sources', 30, 630),
  ('Content sources', 'social_photo_video_contact',
   'Who can help arrange photography or video when new source material is needed?',
   'textarea', null, true, 'optional', 'Calendar & Content Sources', 30, 640),

  -- Platforms ---------------------------------------------------------------
  ('Platforms', 'social_active_channels',
   'These are the social channels we believe are currently active. Is this correct?',
   'multiselect',
   '["Facebook","Instagram","LinkedIn","TikTok","YouTube","X","Pinterest","Other"]'::jsonb,
   true, 'required_by_completion', 'Social Channels', 40, 700),
  ('Platforms', 'social_new_channels',
   'Are there any additional channels you expect Web Wizards to manage?',
   'textarea', null, true, 'optional', 'Social Channels', 40, 710),
  ('Platforms', 'social_other_managers',
   'Is anyone else currently posting, managing or advertising through these accounts?',
   'textarea', null, true, 'required_by_completion', 'Social Channels', 40, 720),
  ('Platforms', 'social_paid_activity',
   'Are there currently any paid social campaigns running that we should coordinate with?',
   'textarea', null, true, 'optional', 'Social Channels', 40, 730),

  -- Approvals ---------------------------------------------------------------
  ('Approvals', 'social_approver',
   'Who should approve social media content?',
   'text', null, true, 'required_by_completion', 'Approvals & Working Together', 50, 750),
  ('Approvals', 'social_visibility_people',
   'Does anyone else need visibility before content is published?',
   'textarea', null, true, 'optional', 'Approvals & Working Together', 50, 760),
  ('Approvals', 'social_preapproved_content',
   'Are there types of routine content that can be published without individual approval?',
   'textarea', null, true, 'optional', 'Approvals & Working Together', 50, 770),
  ('Approvals', 'social_always_approval',
   'Is there anything that should always require explicit approval before publishing?',
   'textarea', null, true, 'optional', 'Approvals & Working Together', 50, 780),

  -- Community management. Off by default: it only applies where community
  -- management is actually in scope, so the Account Manager opts in per intake.
  ('Community management', 'social_current_community_owner',
   'Who currently monitors comments and direct messages?',
   'textarea', null, false, 'optional', 'Approvals & Working Together', 50, 800),
  ('Community management', 'social_direct_response_scope',
   'What types of questions can Web Wizards answer directly?',
   'textarea', null, false, 'optional', 'Approvals & Working Together', 50, 810),
  ('Community management', 'social_escalation_scope',
   'What types of comments, messages or issues should always be escalated to your team?',
   'textarea', null, false, 'optional', 'Approvals & Working Together', 50, 820),
  ('Community management', 'social_escalation_contact',
   'Who should receive those escalations?',
   'text', null, false, 'optional', 'Approvals & Working Together', 50, 830),

  -- Access ------------------------------------------------------------------
  ('Access', 'social_access_admin',
   'Who currently administers your social accounts and can grant Web Wizards access?',
   'text', null, true, 'required_by_completion', 'Access', 60, 850),
  ('Access', 'social_access_status',
   'Has Web Wizards already been granted access to the required social accounts?',
   'select',
   '["Not started","Client needs to grant access","Partially complete","Complete","Unsure"]'::jsonb,
   true, 'optional', 'Access', 60, 860),
  ('Access', 'social_access_notes',
   'Is there anything we should know about how these accounts are currently managed or accessed?',
   'textarea', null, true, 'optional', 'Access', 60, 870),
  ('Access', 'social_existing_reporting',
   'Are there existing social media reports or analytics that would be useful for us to review?',
   'textarea', null, true, 'optional', 'Access', 60, 880)
) as v (section, question_key, question_text, field_type, options,
        default_enabled, required_mode, client_step, client_step_order, sort_order)
on conflict (service_id, question_key) do nothing;

-- Social Media internal preparation.
insert into question_definitions (
  service_id, section, question_key, question_text, field_type,
  default_enabled, required_mode, allow_prefill, client_visible, client_editable,
  client_step, client_step_order, sort_order
)
select
  (select id from services where slug = 'social-media'),
  'Internal preparation', v.question_key, v.question_text, 'textarea',
  true, 'optional', true, false, false,
  null, 0, v.sort_order
from (values
  ('social_internal_channel_observations', 'Existing channel observations', 1100),
  ('social_internal_posting_cadence',      'Current posting cadence',       1110),
  ('social_internal_content_observations', 'Current content observations',  1120)
) as v (question_key, question_text, sort_order)
on conflict (service_id, question_key) do nothing;
