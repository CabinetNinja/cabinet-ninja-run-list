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
  next_action text,
  next_action_due_date date,
  last_contacted_at date,
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
  priority run_item_priority not null default 'normal',
  next_action text,
  next_action_due_date date,
  target_install_date date,
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
