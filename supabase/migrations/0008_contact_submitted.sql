-- ---------------------------------------------------------------------------
-- A contact submits; a questionnaire completes.
--
-- The per-contact status was "finished", shown as "Finished for now". The
-- client-facing action is now "Submit Responses", so the status they are
-- putting themselves into should be called the same thing.
--
-- This is the per-contact lifecycle only:
--
--   not_started -> in_progress -> submitted
--
-- The questionnaire's own lifecycle is untouched and still draft -> live ->
-- complete. There is deliberately no global "submitted" state: one contact
-- submitting says something about that person, not about the questionnaire,
-- and the questionnaire stays open for everyone else.
--
-- Renames rather than adds, so there is no window where two spellings of the
-- same state are both valid. Safe to re-run.
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'contact_participation' and e.enumlabel = 'finished'
  ) then
    alter type contact_participation rename value 'finished' to 'submitted';
  end if;
end $$;

-- The timestamp that goes with it. intakes.submitted_at is a different column
-- on a different table; this one records when a person sent their answers,
-- not when the questionnaire was returned.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'intake_contacts' and column_name = 'finished_at'
  ) then
    alter table intake_contacts rename column finished_at to submitted_at;
  end if;
end $$;

do $$
declare
  labels text;
begin
  select string_agg(e.enumlabel, ',' order by e.enumsortorder) into labels
  from pg_enum e join pg_type t on t.oid = e.enumtypid
  where t.typname = 'contact_participation';

  if labels <> 'not_started,in_progress,submitted' then
    raise exception 'contact_participation should be not_started,in_progress,submitted but is %', labels;
  end if;
end $$;
