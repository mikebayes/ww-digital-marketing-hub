-- Client Intakes — initial schema.
--
-- The Hub was a static documentation site until this migration. These tables
-- are the first thing in it that holds real client information, which is why
-- every table below is RLS-enabled with no policy for the anon role.
--
-- Two access paths exist and only two:
--   1. Internal staff, signed in via Supabase Auth, reaching the tables as the
--      `authenticated` role under the policies at the bottom of this file.
--   2. The public questionnaire, which never talks to PostgREST at all. It is
--      served by Next.js server code holding the service role key, which
--      projects a deliberately narrow set of columns. See lib/intake/public.ts.
--
-- Anonymous browser clients therefore get nothing from these tables even if the
-- anon key leaks, because there is no policy that grants them a row.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type intake_status as enum (
  'draft',
  'ready',
  'sent',
  'in_progress',
  'submitted',
  'reviewed',
  'complete'
);

-- 'required_by_completion' means Web Wizards must resolve the answer before the
-- intake is finished. It never blocks the client from submitting.
create type question_required_mode as enum (
  'required',
  'optional',
  'required_by_completion'
);

create type question_field_type as enum (
  'text',
  'textarea',
  'email',
  'url',
  'select',
  'multiselect',
  'boolean'
);

-- ---------------------------------------------------------------------------
-- Reference data
-- ---------------------------------------------------------------------------

create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  active boolean not null default true,
  sort_order integer not null default 0
);

-- ---------------------------------------------------------------------------
-- Master question library
-- ---------------------------------------------------------------------------

-- The editable master list. Intakes never read this after creation; they read
-- their own snapshot in intake_questions.
create table question_definitions (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services (id) on delete cascade,

  -- Internal grouping, shown to the Account Manager while preparing an intake.
  section text not null,

  -- Stable identifier for a question across edits and services.
  question_key text not null,

  question_text text not null,
  help_text text,
  field_type question_field_type not null default 'textarea',
  options jsonb not null default '[]'::jsonb,

  -- Whether this question is included by default when an intake is created.
  default_enabled boolean not null default true,
  required_mode question_required_mode not null default 'optional',

  -- Whether the Account Manager may pre-fill an answer before sending.
  allow_prefill boolean not null default true,

  -- client_visible false makes this an internal preparation field. It is how
  -- internal notes, handoff context and observations are modelled without a
  -- second table, and it is enforced again in the public projection.
  client_visible boolean not null default true,

  -- Whether the client may change a pre-filled answer.
  client_editable boolean not null default true,

  -- The step the client sees this question under. Grouping lives on the row so
  -- a service can compose its own steps without the form hard-coding any
  -- particular service's structure.
  client_step text,
  client_step_order integer not null default 0,

  sort_order integer not null default 0,

  -- Reserved for later show/hide rules. Stored but not evaluated in v1.
  conditional_config jsonb not null default '{}'::jsonb,

  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (service_id, question_key)
);

create index question_definitions_service_idx
  on question_definitions (service_id, sort_order);

-- ---------------------------------------------------------------------------
-- Intakes
-- ---------------------------------------------------------------------------

create table intakes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete restrict,
  account_manager_name text,
  status intake_status not null default 'draft',

  -- The client's only credential. Generated in application code from a CSPRNG;
  -- see lib/intake/token.ts.
  public_token text not null unique,

  sent_at timestamptz,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index intakes_client_idx on intakes (client_id);
create index intakes_status_idx on intakes (status);

create table intake_services (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references intakes (id) on delete cascade,
  service_id uuid not null references services (id) on delete restrict,
  unique (intake_id, service_id)
);

-- The snapshot. Question wording, options and settings are copied here when the
-- intake is created, so editing the master library later cannot retroactively
-- change what a client was asked or what they agreed to.
create table intake_questions (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references intakes (id) on delete cascade,

  -- Provenance only. Null if the definition is later deleted; the snapshot
  -- stays readable either way.
  question_definition_id uuid references question_definitions (id) on delete set null,
  service_id uuid not null references services (id) on delete restrict,

  section text not null,
  question_key text not null,
  question_text text not null,
  help_text text,
  field_type question_field_type not null default 'textarea',
  options jsonb not null default '[]'::jsonb,
  client_step text,
  client_step_order integer not null default 0,
  sort_order integer not null default 0,

  -- Account Manager controls.
  included boolean not null default true,
  required_mode question_required_mode not null default 'optional',
  client_visible boolean not null default true,
  client_editable boolean not null default true,

  -- Answers are jsonb so a multiselect and a string share one column.
  prefill_answer jsonb,
  client_answer jsonb,
  final_answer jsonb,

  -- Never leaves the building. Excluded from the public projection by column,
  -- not by filter, so a future query change cannot expose it by accident.
  internal_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (intake_id, service_id, question_key)
);

create index intake_questions_intake_idx
  on intake_questions (intake_id, client_step_order, sort_order);

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger clients_updated_at
  before update on clients
  for each row execute function set_updated_at();

create trigger question_definitions_updated_at
  before update on question_definitions
  for each row execute function set_updated_at();

create trigger intakes_updated_at
  before update on intakes
  for each row execute function set_updated_at();

create trigger intake_questions_updated_at
  before update on intake_questions
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
--
-- Enabled everywhere. Signed-in staff get full access; anonymous callers get
-- no policy at all, which under RLS means no rows. The service role used by the
-- public questionnaire bypasses RLS by design and is never sent to a browser.

alter table clients enable row level security;
alter table services enable row level security;
alter table question_definitions enable row level security;
alter table intakes enable row level security;
alter table intake_services enable row level security;
alter table intake_questions enable row level security;

create policy "staff read clients" on clients
  for all to authenticated using (true) with check (true);

create policy "staff read services" on services
  for all to authenticated using (true) with check (true);

create policy "staff read question_definitions" on question_definitions
  for all to authenticated using (true) with check (true);

create policy "staff read intakes" on intakes
  for all to authenticated using (true) with check (true);

create policy "staff read intake_services" on intake_services
  for all to authenticated using (true) with check (true);

create policy "staff read intake_questions" on intake_questions
  for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
--
-- RLS decides which rows a role may touch; it does not grant the privilege to
-- touch the table at all. Supabase's default privileges cover REFERENCES,
-- TRIGGER and TRUNCATE but not DML, so without this block every role — staff
-- included — gets "permission denied for table" and the internal screens do
-- not work.
--
-- anon is revoked explicitly rather than merely left ungranted. It arrives
-- holding TRUNCATE by default, which RLS does not restrain, and the public
-- questionnaire never reaches Postgres as anon anyway.

grant usage on schema public to anon, authenticated, service_role;

revoke all on all tables in schema public from anon;

grant select, insert, update, delete on
  clients, services, question_definitions,
  intakes, intake_services, intake_questions
  to authenticated;

grant select, insert, update, delete on
  clients, services, question_definitions,
  intakes, intake_services, intake_questions
  to service_role;
