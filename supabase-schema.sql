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
create index jobs_active_idx on jobs (active);
create index material_template_items_template_idx on material_template_items (template_id, sort_order);

alter table suppliers enable row level security;
alter table jobs enable row level security;
alter table categories enable row level security;
alter table items enable row level security;
alter table material_templates enable row level security;
alter table material_template_items enable row level security;

create policy "authenticated users can read suppliers"
on suppliers for select to authenticated using (true);
create policy "authenticated users can write suppliers"
on suppliers for all to authenticated using (true) with check (true);

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
