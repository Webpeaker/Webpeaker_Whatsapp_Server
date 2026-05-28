create extension if not exists pgcrypto;

create table if not exists public.whatsapp_sessions (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  name text,
  current_state text not null check (current_state in ('MAIN_MENU', 'SELECTING_SERVICE', 'WAITING_PROJECT_DETAILS', 'WAITING_CALL_DETAILS', 'WAITING_CAREER_DETAILS', 'COMPLETED')),
  selected_service text,
  last_message text,
  updated_at timestamp with time zone default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  name text,
  lead_type text not null,
  service text,
  message text,
  status text default 'new',
  source text default 'whatsapp',
  admin_notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  name text,
  service text,
  preferred_date text,
  preferred_time text,
  requirement text,
  status text default 'pending',
  admin_notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.career_applications (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  name text,
  message text,
  status text default 'new',
  admin_notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  note text not null,
  created_by text,
  created_at timestamp with time zone default now()
);

create table if not exists public.message_logs (
  id uuid primary key default gen_random_uuid(),
  message_id text unique not null,
  phone text not null,
  payload jsonb,
  created_at timestamp with time zone default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_leads_updated_at on public.leads;
create trigger set_leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

drop trigger if exists set_appointments_updated_at on public.appointments;
create trigger set_appointments_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

drop trigger if exists set_career_applications_updated_at on public.career_applications;
create trigger set_career_applications_updated_at
before update on public.career_applications
for each row execute function public.set_updated_at();

alter table public.whatsapp_sessions enable row level security;
alter table public.leads enable row level security;
alter table public.appointments enable row level security;
alter table public.career_applications enable row level security;
alter table public.admin_notes enable row level security;
alter table public.message_logs enable row level security;

drop policy if exists "Admins can read leads" on public.leads;
create policy "Admins can read leads" on public.leads for select to authenticated using (true);
drop policy if exists "Admins can update leads" on public.leads;
create policy "Admins can update leads" on public.leads for update to authenticated using (true) with check (true);

drop policy if exists "Admins can read appointments" on public.appointments;
create policy "Admins can read appointments" on public.appointments for select to authenticated using (true);
drop policy if exists "Admins can update appointments" on public.appointments;
create policy "Admins can update appointments" on public.appointments for update to authenticated using (true) with check (true);

drop policy if exists "Admins can read career applications" on public.career_applications;
create policy "Admins can read career applications" on public.career_applications for select to authenticated using (true);
drop policy if exists "Admins can update career applications" on public.career_applications;
create policy "Admins can update career applications" on public.career_applications for update to authenticated using (true) with check (true);

drop policy if exists "Admins can read notes" on public.admin_notes;
create policy "Admins can read notes" on public.admin_notes for select to authenticated using (true);
drop policy if exists "Admins can add notes" on public.admin_notes;
create policy "Admins can add notes" on public.admin_notes for insert to authenticated with check (true);
