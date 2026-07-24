alter table public.leads
  add column if not exists lead_number text;

create unique index if not exists leads_lead_number_unique_idx
  on public.leads (lead_number)
  where lead_number is not null and lead_number <> '';
