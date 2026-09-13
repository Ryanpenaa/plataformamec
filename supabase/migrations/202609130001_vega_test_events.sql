-- Temporary private inbox. No website user can read or write these records.
create table public.vega_test_events (
  id uuid primary key default gen_random_uuid(),
  received_at timestamptz not null default now(),
  payload jsonb not null check (jsonb_typeof(payload) = 'object')
);
alter table public.vega_test_events enable row level security;
revoke all on public.vega_test_events from anon, authenticated;
grant insert on public.vega_test_events to service_role;
comment on table public.vega_test_events is 'Temporary Vega notification capture. Unverified data; never grants course access.';
