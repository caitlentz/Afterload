-- ============================================================
-- AFTERLOAD DIAGNOSTICS — Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL)
-- ============================================================

-- 1. CLIENTS TABLE
-- One row per unique person. Linked to auth.users via email.
create table if not exists public.clients (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  first_name text,
  business_name text,
  website text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. INTAKE RESPONSES TABLE
-- Stores all intake answers (initial + deep dive) as JSONB.
-- One row per submission. A client may have multiple (if they reset and redo).
create table if not exists public.intake_responses (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.clients(id) on delete cascade,
  email text not null,
  mode text not null check (mode in ('initial', 'deep')),
  track text check (track in ('A', 'B', 'C')),
  answers jsonb not null default '{}',
  created_at timestamptz default now()
);

-- 3. DIAGNOSTIC RESULTS TABLE
-- Stores the full automated analysis output as JSONB.
-- Generated when initial intake completes (preview) or deep dive completes (full).
create table if not exists public.diagnostic_results (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.clients(id) on delete cascade,
  intake_response_id uuid references public.intake_responses(id) on delete cascade,
  email text not null,
  result_type text not null check (result_type in ('preview', 'full')),
  report jsonb not null default '{}',
  created_at timestamptz default now()
);

-- 4. ADMIN NOTES TABLE
-- For you to add your own notes after reviewing a client.
create table if not exists public.admin_notes (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.clients(id) on delete cascade,
  note text not null,
  created_at timestamptz default now()
);

-- Indexes for fast lookups
create index if not exists idx_intake_email on public.intake_responses(email);
create index if not exists idx_intake_client on public.intake_responses(client_id);
create index if not exists idx_diagnostic_email on public.diagnostic_results(email);
create index if not exists idx_diagnostic_client on public.diagnostic_results(client_id);

-- RLS: Enable Row Level Security
alter table public.clients enable row level security;
alter table public.intake_responses enable row level security;
alter table public.diagnostic_results enable row level security;
alter table public.admin_notes enable row level security;

-- Policy: Users can read/write their own data (matched by email from auth.jwt)
create policy "Users can read own client record"
  on public.clients for select
  using (email = auth.jwt() ->> 'email');

create policy "Users can insert own client record"
  on public.clients for insert
  with check (email = auth.jwt() ->> 'email');

create policy "Users can update own client record"
  on public.clients for update
  using (email = auth.jwt() ->> 'email');

create policy "Users can read own intake responses"
  on public.intake_responses for select
  using (email = auth.jwt() ->> 'email');

create policy "Users can insert own intake responses"
  on public.intake_responses for insert
  with check (email = auth.jwt() ->> 'email');

create policy "Users can read own diagnostic results"
  on public.diagnostic_results for select
  using (email = auth.jwt() ->> 'email');

create policy "Users can insert own diagnostic results"
  on public.diagnostic_results for insert
  with check (email = auth.jwt() ->> 'email');

-- Admin notes: only accessible via service role (not from client-side)
-- No public policies — you'll read these from the Supabase dashboard or an admin route
