-- Local-only production-shape bootstrap for Phase 1B tests.
-- Generated from tracked legacy SQL with only the seven Phase 1A-confirmed dashboard-drift fields removed. Never apply to production.

-- BEGIN supabase-schema.sql (production shape)
create extension if not exists pgcrypto;

create type run_item_type as enum ('pickup', 'order', 'delivery', 'stock');
create type run_item_status as enum ('needed', 'ordered', 'ready_to_collect', 'picked_up', 'done', 'cancelled');
create type run_item_priority as enum ('low', 'normal', 'urgent');

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table suppliers (
  id text primary key default gen_random_uuid()::text,
  supplier_name text not null,
  supplier_type text not null default '',
  town text,
  default_contact text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table leads (
  id text primary key default gen_random_uuid()::text,
  lead_number text not null default '',
  lead_name text not null default '',
  client_name text not null default '',
  phone text,
  email text,
  location text not null default '',
  source text,
  status text not null default 'new_lead',
  priority run_item_priority not null default 'normal',
  next_follow_up date,
  notes text,
  converted_job_id text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table jobs (
  id text primary key default gen_random_uuid()::text,
  job_number text not null default '',
  client_name text not null default '',
  job_name text not null default '',
  location text not null default '',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  active boolean not null default true
);

create table categories (
  id text primary key default gen_random_uuid()::text,
  category_name text not null unique,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table items (
  id text primary key default gen_random_uuid()::text,
  item_name text not null,
  quantity text not null default '',
  unit text not null default '',
  supplier_id text not null references suppliers(id),
  job_id text references jobs(id),
  category_id text references categories(id),
  type run_item_type not null default 'pickup',
  status run_item_status not null default 'needed',
  needed_by date,
  priority run_item_priority not null default 'normal',
  notes text,
  product_link text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table material_templates (
  id text primary key default gen_random_uuid()::text,
  template_name text not null,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table material_template_items (
  id text primary key default gen_random_uuid()::text,
  template_id text not null references material_templates(id) on delete cascade,
  item_name text not null,
  quantity text not null default '',
  unit text not null default '',
  supplier_id text references suppliers(id),
  category_id text references categories(id),
  type run_item_type not null default 'pickup',
  priority run_item_priority not null default 'normal',
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger suppliers_set_updated_at before update on suppliers
for each row execute function set_updated_at();

create trigger leads_set_updated_at before update on leads
for each row execute function set_updated_at();

create trigger jobs_set_updated_at before update on jobs
for each row execute function set_updated_at();

create trigger categories_set_updated_at before update on categories
for each row execute function set_updated_at();

create trigger items_set_updated_at before update on items
for each row execute function set_updated_at();

create trigger material_templates_set_updated_at before update on material_templates
for each row execute function set_updated_at();

create trigger material_template_items_set_updated_at before update on material_template_items
for each row execute function set_updated_at();

create index items_active_supplier_idx on items (supplier_id, status);
create index items_active_job_idx on items (job_id, status);
create index items_status_idx on items (status);
create index items_needed_by_idx on items (needed_by);
create index suppliers_active_idx on suppliers (active);
create index leads_status_idx on leads (status, active);
create index leads_follow_up_idx on leads (next_follow_up);
create unique index leads_lead_number_unique_idx on leads (lead_number) where lead_number <> '';
create index jobs_active_idx on jobs (active);
create index material_template_items_template_idx on material_template_items (template_id, sort_order);

alter table suppliers enable row level security;
alter table leads enable row level security;
alter table jobs enable row level security;
alter table categories enable row level security;
alter table items enable row level security;
alter table material_templates enable row level security;
alter table material_template_items enable row level security;

create policy "authenticated users can read suppliers"
on suppliers for select to authenticated using (true);
create policy "authenticated users can write suppliers"
on suppliers for all to authenticated using (true) with check (true);

create policy "authenticated users can read leads"
on leads for select to authenticated using (true);
create policy "authenticated users can write leads"
on leads for all to authenticated using (true) with check (true);

create policy "authenticated users can read jobs"
on jobs for select to authenticated using (true);
create policy "authenticated users can write jobs"
on jobs for all to authenticated using (true) with check (true);

create policy "authenticated users can read categories"
on categories for select to authenticated using (true);
create policy "authenticated users can write categories"
on categories for all to authenticated using (true) with check (true);

create policy "authenticated users can read items"
on items for select to authenticated using (true);
create policy "authenticated users can write items"
on items for all to authenticated using (true) with check (true);

create policy "authenticated users can read material templates"
on material_templates for select to authenticated using (true);
create policy "authenticated users can write material templates"
on material_templates for all to authenticated using (true) with check (true);

create policy "authenticated users can read material template items"
on material_template_items for select to authenticated using (true);
create policy "authenticated users can write material template items"
on material_template_items for all to authenticated using (true) with check (true);

create type checklist_type as enum ('packing', 'qc_completion', 'site_arrival', 'build_readiness', 'measure_up', 'delivery', 'custom');
create type checklist_status as enum ('not_started', 'in_progress', 'complete', 'archived');
create type checklist_issue_status as enum ('none', 'issue_found', 'to_fix', 'fixed', 'accepted', 'not_applicable');

create table checklist_templates (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  type checklist_type not null default 'custom',
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table checklist_template_sections (
  id text primary key default gen_random_uuid()::text,
  template_id text not null references checklist_templates(id) on delete cascade,
  section_name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table checklist_template_items (
  id text primary key default gen_random_uuid()::text,
  section_id text not null references checklist_template_sections(id) on delete cascade,
  item_text text not null,
  sort_order integer not null default 0,
  required boolean not null default true,
  default_notes text,
  allow_photo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table job_checklists (
  id text primary key default gen_random_uuid()::text,
  job_id text not null references jobs(id) on delete cascade,
  template_id text references checklist_templates(id) on delete set null,
  checklist_type checklist_type not null default 'custom',
  title text not null,
  status checklist_status not null default 'not_started',
  override_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table job_checklist_sections (
  id text primary key default gen_random_uuid()::text,
  job_checklist_id text not null references job_checklists(id) on delete cascade,
  section_name text not null,
  sort_order integer not null default 0
);

create table job_checklist_items (
  id text primary key default gen_random_uuid()::text,
  job_checklist_section_id text not null references job_checklist_sections(id) on delete cascade,
  item_text text not null,
  checked boolean not null default false,
  checked_at timestamptz,
  checked_by text,
  required boolean not null default true,
  notes text,
  photo_url text,
  issue_status checklist_issue_status default 'none',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger checklist_templates_set_updated_at before update on checklist_templates
for each row execute function set_updated_at();

create trigger checklist_template_sections_set_updated_at before update on checklist_template_sections
for each row execute function set_updated_at();

create trigger checklist_template_items_set_updated_at before update on checklist_template_items
for each row execute function set_updated_at();

create trigger job_checklists_set_updated_at before update on job_checklists
for each row execute function set_updated_at();

create trigger job_checklist_items_set_updated_at before update on job_checklist_items
for each row execute function set_updated_at();

create index checklist_template_sections_template_idx on checklist_template_sections (template_id, sort_order);
create index checklist_template_items_section_idx on checklist_template_items (section_id, sort_order);
create index job_checklists_job_idx on job_checklists (job_id, checklist_type, status);
create index job_checklist_sections_checklist_idx on job_checklist_sections (job_checklist_id, sort_order);
create index job_checklist_items_section_idx on job_checklist_items (job_checklist_section_id, sort_order);

alter table checklist_templates enable row level security;
alter table checklist_template_sections enable row level security;
alter table checklist_template_items enable row level security;
alter table job_checklists enable row level security;
alter table job_checklist_sections enable row level security;
alter table job_checklist_items enable row level security;

create policy "authenticated users can read checklist templates"
on checklist_templates for select to authenticated using (true);
create policy "authenticated users can write checklist templates"
on checklist_templates for all to authenticated using (true) with check (true);

create policy "authenticated users can read checklist template sections"
on checklist_template_sections for select to authenticated using (true);
create policy "authenticated users can write checklist template sections"
on checklist_template_sections for all to authenticated using (true) with check (true);

create policy "authenticated users can read checklist template items"
on checklist_template_items for select to authenticated using (true);
create policy "authenticated users can write checklist template items"
on checklist_template_items for all to authenticated using (true) with check (true);

create policy "authenticated users can read job checklists"
on job_checklists for select to authenticated using (true);
create policy "authenticated users can write job checklists"
on job_checklists for all to authenticated using (true) with check (true);

create policy "authenticated users can read job checklist sections"
on job_checklist_sections for select to authenticated using (true);
create policy "authenticated users can write job checklist sections"
on job_checklist_sections for all to authenticated using (true) with check (true);

create policy "authenticated users can read job checklist items"
on job_checklist_items for select to authenticated using (true);
create policy "authenticated users can write job checklist items"
on job_checklist_items for all to authenticated using (true) with check (true);

-- END supabase-schema.sql

-- BEGIN supabase-checklists-migration.sql
do $$
begin
  create type checklist_type as enum ('packing', 'qc_completion', 'site_arrival', 'build_readiness', 'measure_up', 'delivery', 'custom');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type checklist_status as enum ('not_started', 'in_progress', 'complete', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type checklist_issue_status as enum ('none', 'issue_found', 'to_fix', 'fixed', 'accepted', 'not_applicable');
exception
  when duplicate_object then null;
end $$;

create table if not exists checklist_templates (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  type checklist_type not null default 'custom',
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists checklist_template_sections (
  id text primary key default gen_random_uuid()::text,
  template_id text not null references checklist_templates(id) on delete cascade,
  section_name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists checklist_template_items (
  id text primary key default gen_random_uuid()::text,
  section_id text not null references checklist_template_sections(id) on delete cascade,
  item_text text not null,
  sort_order integer not null default 0,
  required boolean not null default true,
  default_notes text,
  allow_photo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists job_checklists (
  id text primary key default gen_random_uuid()::text,
  job_id text not null references jobs(id) on delete cascade,
  template_id text references checklist_templates(id) on delete set null,
  checklist_type checklist_type not null default 'custom',
  title text not null,
  status checklist_status not null default 'not_started',
  override_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists job_checklist_sections (
  id text primary key default gen_random_uuid()::text,
  job_checklist_id text not null references job_checklists(id) on delete cascade,
  section_name text not null,
  sort_order integer not null default 0
);

create table if not exists job_checklist_items (
  id text primary key default gen_random_uuid()::text,
  job_checklist_section_id text not null references job_checklist_sections(id) on delete cascade,
  item_text text not null,
  checked boolean not null default false,
  checked_at timestamptz,
  checked_by text,
  required boolean not null default true,
  notes text,
  photo_url text,
  issue_status checklist_issue_status default 'none',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  create trigger checklist_templates_set_updated_at before update on checklist_templates
  for each row execute function set_updated_at();
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create trigger checklist_template_sections_set_updated_at before update on checklist_template_sections
  for each row execute function set_updated_at();
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create trigger checklist_template_items_set_updated_at before update on checklist_template_items
  for each row execute function set_updated_at();
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create trigger job_checklists_set_updated_at before update on job_checklists
  for each row execute function set_updated_at();
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create trigger job_checklist_items_set_updated_at before update on job_checklist_items
  for each row execute function set_updated_at();
exception
  when duplicate_object then null;
end $$;

create index if not exists checklist_template_sections_template_idx on checklist_template_sections (template_id, sort_order);
create index if not exists checklist_template_items_section_idx on checklist_template_items (section_id, sort_order);
create index if not exists job_checklists_job_idx on job_checklists (job_id, checklist_type, status);
create index if not exists job_checklist_sections_checklist_idx on job_checklist_sections (job_checklist_id, sort_order);
create index if not exists job_checklist_items_section_idx on job_checklist_items (job_checklist_section_id, sort_order);

alter table checklist_templates enable row level security;
alter table checklist_template_sections enable row level security;
alter table checklist_template_items enable row level security;
alter table job_checklists enable row level security;
alter table job_checklist_sections enable row level security;
alter table job_checklist_items enable row level security;

do $$
begin
  create policy "authenticated users can read checklist templates" on checklist_templates for select to authenticated using (true);
  create policy "authenticated users can write checklist templates" on checklist_templates for all to authenticated using (true) with check (true);
  create policy "authenticated users can read checklist template sections" on checklist_template_sections for select to authenticated using (true);
  create policy "authenticated users can write checklist template sections" on checklist_template_sections for all to authenticated using (true) with check (true);
  create policy "authenticated users can read checklist template items" on checklist_template_items for select to authenticated using (true);
  create policy "authenticated users can write checklist template items" on checklist_template_items for all to authenticated using (true) with check (true);
  create policy "authenticated users can read job checklists" on job_checklists for select to authenticated using (true);
  create policy "authenticated users can write job checklists" on job_checklists for all to authenticated using (true) with check (true);
  create policy "authenticated users can read job checklist sections" on job_checklist_sections for select to authenticated using (true);
  create policy "authenticated users can write job checklist sections" on job_checklist_sections for all to authenticated using (true) with check (true);
  create policy "authenticated users can read job checklist items" on job_checklist_items for select to authenticated using (true);
  create policy "authenticated users can write job checklist items" on job_checklist_items for all to authenticated using (true) with check (true);
exception
  when duplicate_object then null;
end $$;

-- END supabase-checklists-migration.sql

-- BEGIN supabase-leads-migration.sql
create table if not exists leads (
  id text primary key default gen_random_uuid()::text,
  lead_name text not null default '',
  client_name text not null default '',
  phone text,
  email text,
  location text not null default '',
  source text,
  status text not null default 'new_lead',
  priority run_item_priority not null default 'normal',
  next_follow_up date,
  notes text,
  converted_job_id text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  create trigger leads_set_updated_at before update on leads
  for each row execute function set_updated_at();
exception
  when duplicate_object then null;
end $$;

create index if not exists leads_status_idx on leads (status, active);
create index if not exists leads_follow_up_idx on leads (next_follow_up);

alter table leads enable row level security;

do $$
begin
  create policy "authenticated users can read leads" on leads for select to authenticated using (true);
  create policy "authenticated users can write leads" on leads for all to authenticated using (true) with check (true);
exception
  when duplicate_object then null;
end $$;

-- END supabase-leads-migration.sql

-- BEGIN supabase-lead-number-migration.sql
alter table public.leads
  add column if not exists lead_number text;

create unique index if not exists leads_lead_number_unique_idx
  on public.leads (lead_number)
  where lead_number is not null and lead_number <> '';

-- END supabase-lead-number-migration.sql

-- BEGIN supabase-workshop-cnc-migration.sql
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

-- END supabase-workshop-cnc-migration.sql
