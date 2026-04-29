-- Penny Outbound Calls
-- Voice AI agent (Retell) outbound call log + audit trail.
-- Mirrors landlord_expense_approvals pattern: permissive RLS for authenticated users,
-- everyone signed in can see/insert/delete history.

create table public.penny_outbound_calls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,

  -- Caller-provided form data (denormalised for list/search performance).
  to_number text not null,
  applicant_name text not null,
  property_address text not null,
  agency_name text not null default 'Harcourts Ulverstone Penguin',
  referee_name text not null,
  referee_relationship text not null
    check (referee_relationship in ('previous landlord','current employer','personal friend')),
  tenancy_address text,
  tenancy_landlord_type text
    check (tenancy_landlord_type is null or tenancy_landlord_type in ('landlord','agent')),
  application_id text,
  call_mode text not null default 'phone'
    check (call_mode in ('phone','web')),

  -- Retell side-effects.
  retell_call_id text,
  retell_call_status text not null default 'initiating',
  -- Expected values: initiating | registered | ongoing | ended | failed
  error_message text,
  -- Verbatim payload sent to Retell as retell_llm_dynamic_variables.
  -- Stored so we can replay exactly the same variables on Recall.
  dynamic_variables jsonb not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.penny_outbound_calls enable row level security;

-- Permissive policies (matches landlord_expense_approvals + callback_requests pattern):
-- any authenticated user can SELECT/INSERT/UPDATE/DELETE.
-- Anonymous users get nothing.
create policy "Authenticated read all penny calls"
  on public.penny_outbound_calls
  for select
  to authenticated
  using (true);

create policy "Authenticated insert penny calls"
  on public.penny_outbound_calls
  for insert
  to authenticated
  with check (true);

create policy "Authenticated update penny calls"
  on public.penny_outbound_calls
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated delete penny calls"
  on public.penny_outbound_calls
  for delete
  to authenticated
  using (true);

-- Indexes for common query patterns.
create index penny_outbound_calls_created_at_idx
  on public.penny_outbound_calls(created_at desc);

create index penny_outbound_calls_user_id_idx
  on public.penny_outbound_calls(user_id);

create index penny_outbound_calls_retell_call_id_idx
  on public.penny_outbound_calls(retell_call_id)
  where retell_call_id is not null;

-- handle_updated_at() is already defined in create_callback_requests.sql — reuse it.
create trigger penny_outbound_calls_updated_at
  before update on public.penny_outbound_calls
  for each row
  execute function public.handle_updated_at();
