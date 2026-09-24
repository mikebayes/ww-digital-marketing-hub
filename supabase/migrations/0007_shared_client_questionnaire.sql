-- ---------------------------------------------------------------------------
-- A shared questionnaire, and the end of Internal Preparation.
--
-- Two changes that belong together, because both come from the same
-- realisation: the questionnaire is a thing several people at the client fill
-- in together, and it is not where Web Wizards writes down what it already
-- knows.
--
--   1. The nine Internal Preparation fields are retired. The Internal Service
--      Brief is the handoff record; asking an Account Manager to retype it
--      into nine textareas was duplicate work with a second source of truth.
--
--   2. Answers become collaborative. Several approved client contacts work on
--      one shared set, each answer carries who last touched it, and every
--      change is kept.
--
-- Additive. No snapshot row is rewritten and no answer is moved: the nine
-- fields stay in intake_questions for every questionnaire that already has
-- them, deactivated in the library so new ones do not, and filtered out of the
-- admin rather than deleted.
--
-- Safe to re-run.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 1. Retire Internal Preparation from the library.
--
-- Deactivated, not deleted. snapshotQuestions filters on active, so a new
-- questionnaire never copies them, while intake_questions.question_definition_id
-- still resolves for every questionnaire that already did.

update question_definitions
set active = false
where client_visible = false;

-- ---------------------------------------------------------------------------
-- 2. Participation, per contact.
--
-- Not "respondent". There is one questionnaire and one set of answers; this
-- records how far each person has got with it, which is a different thing from
-- each person having their own copy.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'contact_participation') then
    create type contact_participation as enum (
      'not_started',
      'in_progress',
      'finished'
    );
  end if;
end $$;

alter table intake_contacts
  add column if not exists participation contact_participation not null default 'not_started',
  add column if not exists first_accessed_at timestamptz,
  add column if not exists last_activity_at timestamptz,
  add column if not exists finished_at timestamptz;

-- ---------------------------------------------------------------------------
-- 3. Attribution, per answer.
--
-- on delete set null, not cascade: removing a contact must not remove the
-- answers they gave. The attribution degrades to "contributor not recorded",
-- which is honest, rather than taking the answer with it.

alter table intake_questions
  add column if not exists answered_by_contact_id uuid
    references intake_contacts (id) on delete set null,
  add column if not exists answered_at timestamptz,
  -- How many times a client has written this answer. 1 is "provided", more is
  -- "updated" — which is the only difference the attribution line needs, and
  -- cheaper than counting revisions on every render.
  add column if not exists answer_revision_count integer not null default 0;

-- ---------------------------------------------------------------------------
-- 4. What changed, and who changed it.
--
-- contact_id is nullable on purpose. Answers given before the email gate
-- existed have no contact to point at, and inventing one would be worse than
-- recording that we do not know.

create table if not exists intake_answer_revisions (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references intakes (id) on delete cascade,
  intake_question_id uuid not null references intake_questions (id) on delete cascade,
  contact_id uuid references intake_contacts (id) on delete set null,

  -- jsonb, because an answer is a string, a list or a boolean depending on the
  -- field type, and a text column would lose that distinction on the way in.
  previous_answer jsonb,
  new_answer jsonb,

  created_at timestamptz not null default now()
);

create index if not exists intake_answer_revisions_question_idx
  on intake_answer_revisions (intake_question_id, created_at desc);

create index if not exists intake_answer_revisions_intake_idx
  on intake_answer_revisions (intake_id, created_at desc);

alter table intake_answer_revisions enable row level security;

drop policy if exists "staff read intake_answer_revisions" on intake_answer_revisions;
create policy "staff read intake_answer_revisions" on intake_answer_revisions
  for all to authenticated using (true) with check (true);

revoke all on intake_answer_revisions from anon;
grant select, insert, update, delete on intake_answer_revisions to authenticated;
grant select, insert, update, delete on intake_answer_revisions to service_role;

-- ---------------------------------------------------------------------------
-- 5. Writing an answer and its history, together.
--
-- One function so the two writes cannot come apart. A plpgsql body runs inside
-- a single transaction: either the answer moves and the revision is recorded,
-- or neither happens.
--
-- It also re-checks what may be written. The caller has already validated the
-- session, but the question must still belong to this intake, be included, and
-- be client-visible — so a forged question id cannot reach an internal field
-- or another client's questionnaire even if everything upstream were wrong.
--
-- Returns false when nothing changed, so an unchanged value writes no revision
-- and does not re-attribute an answer somebody else gave.

create or replace function record_client_answer(
  p_intake_id uuid,
  p_question_id uuid,
  p_contact_id uuid,
  p_answer jsonb
) returns boolean
language plpgsql
as $$
declare
  v_current jsonb;
begin
  select client_answer into v_current
  from intake_questions
  where id = p_question_id
    and intake_id = p_intake_id
    and included = true
    and client_visible = true
  for update;

  if not found then
    return false;
  end if;

  -- is not distinct from: null-safe, so clearing an already-empty answer is
  -- correctly a no-op rather than a revision from null to null.
  if v_current is not distinct from p_answer then
    return false;
  end if;

  update intake_questions
  set client_answer = p_answer,
      answered_by_contact_id = p_contact_id,
      answered_at = now(),
      answer_revision_count = answer_revision_count + 1
  where id = p_question_id;

  insert into intake_answer_revisions (
    intake_id, intake_question_id, contact_id, previous_answer, new_answer
  ) values (
    p_intake_id, p_question_id, p_contact_id, v_current, p_answer
  );

  return true;
end $$;

-- The public route reaches Postgres as service_role and never as anon.
revoke all on function record_client_answer(uuid, uuid, uuid, jsonb) from public;
revoke all on function record_client_answer(uuid, uuid, uuid, jsonb) from anon;
grant execute on function record_client_answer(uuid, uuid, uuid, jsonb) to service_role;

-- ---------------------------------------------------------------------------
-- 6. Backfill the revision count for answers that already exist.
--
-- Set to 1 so an answer given before today reads as "provided" rather than
-- "updated". Its contact stays null: we do not know who wrote it, and the
-- attribution line says so.

update intake_questions
set answer_revision_count = 1
where client_answer is not null
  and answer_revision_count = 0;

-- ---------------------------------------------------------------------------

do $$
declare
  retired int;
begin
  select count(*) into retired
  from question_definitions where client_visible = false and active;

  if retired <> 0 then
    raise exception 'Internal Preparation should be fully retired, % still active', retired;
  end if;
end $$;
