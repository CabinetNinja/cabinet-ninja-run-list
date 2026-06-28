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
