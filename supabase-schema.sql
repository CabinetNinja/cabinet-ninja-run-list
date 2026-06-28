create type run_item_type as enum ('pickup', 'order', 'delivery', 'stock');
create type run_item_status as enum ('needed', 'ordered', 'ready_to_collect', 'picked_up', 'done', 'cancelled');
create type run_item_priority as enum ('low', 'normal', 'urgent');

create table suppliers (
  id uuid primary key default gen_random_uuid(),
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
  id uuid primary key default gen_random_uuid(),
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
  id uuid primary key default gen_random_uuid(),
  category_name text not null unique,
  notes text
);

create table items (
  id uuid primary key default gen_random_uuid(),
  item_name text not null,
  quantity text not null default '',
  unit text not null default '',
  supplier_id uuid not null references suppliers(id),
  job_id uuid references jobs(id),
  category_id uuid references categories(id),
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
  id uuid primary key default gen_random_uuid(),
  template_name text not null,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table material_template_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references material_templates(id) on delete cascade,
  item_name text not null,
  quantity text not null default '',
  unit text not null default '',
  supplier_id uuid references suppliers(id),
  category_id uuid references categories(id),
  type run_item_type not null default 'pickup',
  priority run_item_priority not null default 'normal',
  notes text,
  sort_order integer not null default 0
);

create index items_active_supplier_idx on items (supplier_id, status);
create index items_active_job_idx on items (job_id, status);
create index items_status_idx on items (status);
create index items_needed_by_idx on items (needed_by);
create index suppliers_active_idx on suppliers (active);
create index jobs_active_idx on jobs (active);
