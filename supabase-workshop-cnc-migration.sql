-- Cabinet Ninja Run List: Workshop / Mozaik CNC tracking
-- Run this once in Supabase SQL editor for existing Run List projects.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'cut_pattern_status') then
    create type cut_pattern_status as enum ('files_incomplete', 'ready_for_cnc', 'cutting', 'partially_cut', 'cut_complete', 'problem', 'superseded', 'cancelled');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'remake_status') then
    create type remake_status as enum ('requested', 'waiting_to_add_to_mozaik', 'added_to_mozaik', 'waiting_for_updated_files', 'ready_for_cnc', 'cut', 'edge_banding', 'quality_check', 'returned_to_job', 'cancelled');
  end if;
end $$;

create table if not exists job_files (
  id text primary key default gen_random_uuid()::text,
  job_id text not null references jobs(id) on delete cascade,
  storage_path text,
  file_url text,
  file_kind text not null default '',
  original_filename text not null default '',
  internal_filename text not null default '',
  file_hash text not null default '',
  file_size bigint not null default 0,
  mime_type text,
  imported_at timestamptz not null default now(),
  imported_by text,
  source text not null default 'manual_upload',
  notes text,
  is_superseded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cut_patterns (
  id text primary key default gen_random_uuid()::text,
  job_id text not null references jobs(id) on delete cascade,
  material_code text not null default '',
  material_description text not null default '',
  thickness text not null default '',
  pattern_number text not null default '',
  current_revision_id text,
  status cut_pattern_status not null default 'files_incomplete',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cut_pattern_revisions (
  id text primary key default gen_random_uuid()::text,
  cut_pattern_id text not null references cut_patterns(id) on delete cascade,
  job_id text not null references jobs(id) on delete cascade,
  filename_revision text not null default 'R01',
  internal_revision integer not null default 1,
  required_run_quantity integer not null default 1 check (required_run_quantity > 0),
  completed_run_quantity integer not null default 0 check (completed_run_quantity >= 0),
  pdf_file_id text references job_files(id) on delete set null,
  nc_file_id text references job_files(id) on delete set null,
  pdf_filename text,
  nc_filename text,
  file_hash_pdf text,
  file_hash_nc text,
  is_current boolean not null default true,
  is_superseded boolean not null default false,
  imported_at timestamptz not null default now(),
  imported_by text,
  revision_notes text,
  production_status cut_pattern_status not null default 'files_incomplete',
  review_required boolean not null default false,
  review_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint completed_not_above_required check (completed_run_quantity <= required_run_quantity)
);

create table if not exists cut_runs (
  id text primary key default gen_random_uuid()::text,
  cut_pattern_revision_id text not null references cut_pattern_revisions(id) on delete cascade,
  run_number integer not null,
  status text not null default 'complete',
  started_at timestamptz,
  started_by text,
  completed_at timestamptz,
  completed_by text,
  notes text,
  has_problem boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cut_pattern_revision_id, run_number)
);

create table if not exists cut_part_suggestions (
  id text primary key default gen_random_uuid()::text,
  cut_pattern_revision_id text not null references cut_pattern_revisions(id) on delete cascade,
  source_part_number text,
  part_name text,
  width text,
  length text,
  banding text,
  cabinet_number text,
  comment text,
  pdf_page_number text,
  raw_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists remake_requests (
  id text primary key default gen_random_uuid()::text,
  job_id text not null references jobs(id) on delete cascade,
  source_cut_pattern_revision_id text references cut_pattern_revisions(id) on delete set null,
  destination_cut_pattern_revision_id text references cut_pattern_revisions(id) on delete set null,
  source_part_suggestion_id text references cut_part_suggestions(id) on delete set null,
  part_number text,
  part_name text,
  description text,
  cabinet_number text,
  quantity integer not null default 1 check (quantity > 0),
  material_code text,
  material_description text,
  thickness text,
  width text,
  length text,
  banding text,
  reason text not null default 'other',
  damage_stage text not null default 'unknown',
  notes text,
  priority run_item_priority not null default 'normal',
  required_by date,
  status remake_status not null default 'waiting_to_add_to_mozaik',
  assigned_person text,
  requested_by text,
  requested_at timestamptz not null default now(),
  added_to_mozaik_at timestamptz,
  cut_confirmed_at timestamptz,
  cut_confirmed_by text,
  quality_checked_at timestamptz,
  returned_to_job_at timestamptz,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint remake_has_description check (
    coalesce(part_number, '') <> '' or coalesce(part_name, '') <> '' or coalesce(description, '') <> ''
  )
);

create table if not exists activity_history (
  id text primary key default gen_random_uuid()::text,
  job_id text references jobs(id) on delete set null,
  entity_type text not null default '',
  entity_id text,
  action text not null default '',
  user_email text,
  happened_at timestamptz not null default now(),
  previous_value text,
  new_value text,
  reason text,
  notes text
);

create trigger job_files_set_updated_at before update on job_files
for each row execute function set_updated_at();
create trigger cut_patterns_set_updated_at before update on cut_patterns
for each row execute function set_updated_at();
create trigger cut_pattern_revisions_set_updated_at before update on cut_pattern_revisions
for each row execute function set_updated_at();
create trigger cut_runs_set_updated_at before update on cut_runs
for each row execute function set_updated_at();
create trigger cut_part_suggestions_set_updated_at before update on cut_part_suggestions
for each row execute function set_updated_at();
create trigger remake_requests_set_updated_at before update on remake_requests
for each row execute function set_updated_at();

create index if not exists job_files_job_idx on job_files (job_id, file_kind);
create index if not exists cut_patterns_job_idx on cut_patterns (job_id, material_code, pattern_number);
create index if not exists cut_revisions_pattern_idx on cut_pattern_revisions (cut_pattern_id, is_current, is_superseded);
create index if not exists cut_runs_revision_idx on cut_runs (cut_pattern_revision_id, run_number);
create index if not exists remakes_job_status_idx on remake_requests (job_id, status);
create index if not exists remakes_required_by_idx on remake_requests (required_by, status);
create index if not exists activity_job_idx on activity_history (job_id, happened_at desc);

alter table job_files enable row level security;
alter table cut_patterns enable row level security;
alter table cut_pattern_revisions enable row level security;
alter table cut_runs enable row level security;
alter table cut_part_suggestions enable row level security;
alter table remake_requests enable row level security;
alter table activity_history enable row level security;

create policy "authenticated users can read job files"
on job_files for select to authenticated using (true);
create policy "authenticated users can write job files"
on job_files for all to authenticated using (true) with check (true);

create policy "authenticated users can read cut patterns"
on cut_patterns for select to authenticated using (true);
create policy "authenticated users can write cut patterns"
on cut_patterns for all to authenticated using (true) with check (true);

create policy "authenticated users can read cut pattern revisions"
on cut_pattern_revisions for select to authenticated using (true);
create policy "authenticated users can write cut pattern revisions"
on cut_pattern_revisions for all to authenticated using (true) with check (true);

create policy "authenticated users can read cut runs"
on cut_runs for select to authenticated using (true);
create policy "authenticated users can write cut runs"
on cut_runs for all to authenticated using (true) with check (true);

create policy "authenticated users can read cut part suggestions"
on cut_part_suggestions for select to authenticated using (true);
create policy "authenticated users can write cut part suggestions"
on cut_part_suggestions for all to authenticated using (true) with check (true);

create policy "authenticated users can read remake requests"
on remake_requests for select to authenticated using (true);
create policy "authenticated users can write remake requests"
on remake_requests for all to authenticated using (true) with check (true);

create policy "authenticated users can read activity history"
on activity_history for select to authenticated using (true);
create policy "authenticated users can write activity history"
on activity_history for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('job-files', 'job-files', true)
on conflict (id) do nothing;

create policy "authenticated users can upload job files"
on storage.objects for insert to authenticated
with check (bucket_id = 'job-files');

create policy "authenticated users can read job files"
on storage.objects for select to authenticated
using (bucket_id = 'job-files');
