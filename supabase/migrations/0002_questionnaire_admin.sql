-- ---------------------------------------------------------------------------
-- Client Questionnaires admin.
--
-- Additive only. Nothing here rewrites or drops existing data: the All Weather
-- intake and the question snapshots behind it are untouched, and every new
-- column is nullable so existing rows stay valid without a backfill.
--
-- Safe to re-run.
-- ---------------------------------------------------------------------------

-- A questionnaire can be named. Null means "derive it from the client and the
-- services", which is what every existing intake does and what most will.
alter table intakes add column if not exists title text;

-- The paragraph the client reads above the first question. Null falls back to
-- the standard wording in the public shell, so an intake that never sets this
-- reads exactly as it does today.
alter table intakes add column if not exists intro_text text;

-- Archive rather than delete. A questionnaire holds what a client told us and
-- what we agreed to do about it; removing the row removes the record of that.
-- Archiving hides it from the list and nothing else.
alter table intakes add column if not exists archived_at timestamptz;

create index if not exists intakes_archived_idx on intakes (archived_at);

-- ---------------------------------------------------------------------------
--
-- Approved client contacts.
--
-- Record-keeping for now: who at the client this questionnaire was sent to and
-- who is expected to answer it. The public route still authenticates with the
-- token alone — this table does not gate anything yet, deliberately, because
-- the approved-email gate is a separate piece of work.
--
-- Built as a table rather than columns on intakes because the answer to "who
-- is the client contact" is already sometimes more than one person, and a
-- second contact should not mean a schema change.

create table if not exists intake_contacts (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references intakes (id) on delete cascade,
  name text not null,
  email text not null,

  -- The person we would chase. Not enforced as unique per intake: an intake
  -- with two primaries is a data-entry mistake, not a corruption, and the
  -- admin writes this field one row at a time.
  is_primary boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- The same person twice on one questionnaire is always a mistake.
  unique (intake_id, email)
);

create index if not exists intake_contacts_intake_idx
  on intake_contacts (intake_id);

drop trigger if exists intake_contacts_updated_at on intake_contacts;
create trigger intake_contacts_updated_at
  before update on intake_contacts
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
--
-- Same posture as every other table: RLS on, staff only, anon revoked
-- explicitly rather than merely left ungranted.

alter table intake_contacts enable row level security;

drop policy if exists "staff read intake_contacts" on intake_contacts;
create policy "staff read intake_contacts" on intake_contacts
  for all to authenticated using (true) with check (true);

revoke all on intake_contacts from anon;

grant select, insert, update, delete on intake_contacts to authenticated;
grant select, insert, update, delete on intake_contacts to service_role;
