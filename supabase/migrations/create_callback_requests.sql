-- Create callback_requests table
create table public.callback_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone_number text not null,
  preferred_date text default 'Earliest availability',
  preferred_time text default 'Anytime',
  header text not null check (length(header) <= 50),
  summary_conversation text not null,
  importance text not null check (importance in ('Low', 'Medium', 'High')),
  helpful_insights text not null,
  status text default 'Pending' check (status in ('Pending', 'Contacted', 'Completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.callback_requests enable row level security;

-- All users can view callback requests
create policy "Users can view callback requests"
  on public.callback_requests for select
  using (true);

-- All users can insert callback requests
create policy "Users can insert callback requests"
  on public.callback_requests for insert
  with check (true);

-- Admins can update callback requests
create policy "Admins can update callback requests"
  on public.callback_requests for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Create index for faster queries
create index callback_requests_status_idx on public.callback_requests(status);
create index callback_requests_importance_idx on public.callback_requests(importance);
create index callback_requests_created_at_idx on public.callback_requests(created_at desc);

-- Add trigger to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger callback_requests_updated_at
  before update on public.callback_requests
  for each row
  execute function public.handle_updated_at();
