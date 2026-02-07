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

-- ─── AUTHENTICATED user policies ────────────────────────────────────
-- Logged-in users can read/update their own rows (email must match JWT)
create policy "Users can read own client record"
  on public.clients for select
  using (email = auth.jwt() ->> 'email');

create policy "Users can update own client record"
  on public.clients for update
  using (email = auth.jwt() ->> 'email');

create policy "Users can read own intake responses"
  on public.intake_responses for select
  using (email = auth.jwt() ->> 'email');

create policy "Users can read own diagnostic results"
  on public.diagnostic_results for select
  using (email = auth.jwt() ->> 'email');

-- ─── ANONYMOUS + AUTHENTICATED insert policies ─────────────────────
-- The landing-page intake runs BEFORE the user logs in, so we need
-- to allow unauthenticated (anon-key) inserts. This is safe because:
--   • Inserts only — no read, update, or delete for anon
--   • The data is the user's own intake answers (not sensitive to others)
--   • Read access stays restricted to authenticated users matching their email
create policy "Anyone can insert client record"
  on public.clients for insert
  with check (true);

create policy "Anyone can insert intake response"
  on public.intake_responses for insert
  with check (true);

create policy "Anyone can insert diagnostic result"
  on public.diagnostic_results for insert
  with check (true);

-- ─── ADMIN notes ────────────────────────────────────────────────────
-- admin_notes: only accessible via service role or the admin RPC below.
-- No direct public policies.

-- ─── ADMIN RPC: fetch all clients with related data ─────────────────
-- Runs as SECURITY DEFINER so it bypasses RLS (like using the service role).
-- Called from the admin dashboard after PIN verification.
create or replace function public.admin_fetch_all_clients()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return (
    select coalesce(jsonb_agg(row_to_json(c)::jsonb || jsonb_build_object(
      'intake_responses', coalesce((
        select jsonb_agg(row_to_json(ir))
        from intake_responses ir where ir.client_id = c.id
      ), '[]'::jsonb),
      'diagnostic_results', coalesce((
        select jsonb_agg(row_to_json(dr))
        from diagnostic_results dr where dr.client_id = c.id
      ), '[]'::jsonb),
      'admin_notes', coalesce((
        select jsonb_agg(row_to_json(an))
        from admin_notes an where an.client_id = c.id
      ), '[]'::jsonb)
    )), '[]'::jsonb)
    from clients c
    order by c.created_at desc
  );
end;
$$;

-- Admin RPC: fetch all payments
create or replace function public.admin_fetch_all_payments()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return (
    select coalesce(jsonb_agg(row_to_json(p)), '[]'::jsonb)
    from payments p
    order by p.created_at desc
  );
end;
$$;

-- Admin RPC: save admin note (bypasses RLS on admin_notes)
create or replace function public.admin_save_note(p_client_id uuid, p_note text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into admin_notes (client_id, note) values (p_client_id, p_note);
end;
$$;
