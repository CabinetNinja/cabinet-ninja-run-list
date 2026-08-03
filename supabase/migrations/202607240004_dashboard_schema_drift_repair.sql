-- Phase 1B: verified repair for the production dashboard-schema drift.
-- Definitions are copied from the tracked dashboard migration and are idempotent.

alter table public.leads
  add column if not exists next_action text,
  add column if not exists next_action_due_date date,
  add column if not exists last_contacted_at date;

alter table public.jobs
  add column if not exists priority public.run_item_priority not null default 'normal',
  add column if not exists next_action text,
  add column if not exists next_action_due_date date,
  add column if not exists target_install_date date;

create index if not exists leads_next_action_due_idx on public.leads (next_action_due_date);
create index if not exists jobs_next_action_due_idx on public.jobs (next_action_due_date);
create index if not exists jobs_target_install_date_idx on public.jobs (target_install_date);
