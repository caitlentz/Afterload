-- ============================================================
-- AFTERLOAD DIAGNOSTICS — RLS Patch
-- Run this in Supabase SQL Editor (Dashboard → SQL → New Query)
--
-- This patch:
--   1. Drops the old auth-only insert policies
--   2. Adds anonymous insert policies (so landing-page intake works)
--   3. Creates admin RPC functions (so admin dashboard can read all data)
-- ============================================================

-- ─── Step 1: Drop old auth-only insert policies ────────────────────
drop policy if exists "Users can insert own client record" on public.clients;
drop policy if exists "Users can insert own intake responses" on public.intake_responses;
drop policy if exists "Users can insert own diagnostic results" on public.diagnostic_results;

-- ─── Step 2: Add anonymous + authenticated insert policies ─────────
-- The landing-page intake runs BEFORE the user logs in, so we need
-- to allow unauthenticated (anon-key) inserts. This is safe because:
--   • Inserts only — no read, update, or delete for anon
--   • The data is the user's own intake answers
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

-- ─── Step 3: Admin RPC functions ───────────────────────────────────
-- These run as SECURITY DEFINER (bypasses RLS, like service role).
-- Called from admin dashboard after PIN verification.

-- Fetch all clients with nested intake, diagnostic, and notes
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

-- Fetch all payments
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

-- Save admin note (bypasses RLS on admin_notes table)
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

-- ============================================================
-- DONE! You should see "Success. No rows returned." for each statement.
-- Test by refreshing the site and completing the intake form.
-- ============================================================
