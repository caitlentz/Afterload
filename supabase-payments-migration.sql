-- ============================================================
-- AFTERLOAD — Payments Table + Stripe Webhook Support
-- Run this in your Supabase SQL Editor (Dashboard → SQL)
-- ============================================================

-- PAYMENTS TABLE
-- Tracks each Stripe payment event. Two expected rows per client:
--   1. deposit ($300) — unlocks deep dive questions
--   2. balance ($900) — due before report delivery
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.clients(id) on delete set null,
  email text not null,
  stripe_payment_intent_id text unique,        -- Stripe's pi_xxxx ID
  stripe_checkout_session_id text,             -- Stripe's cs_xxxx ID
  payment_type text not null check (payment_type in ('deposit', 'balance')),
  amount_cents integer not null,               -- 30000 = $300, 90000 = $900
  currency text default 'usd',
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  stripe_event_id text,                        -- For idempotency
  metadata jsonb default '{}',                 -- Any extra Stripe data
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_payments_email on public.payments(email);
create index if not exists idx_payments_client on public.payments(client_id);
create index if not exists idx_payments_stripe_pi on public.payments(stripe_payment_intent_id);
create index if not exists idx_payments_status on public.payments(status);

-- RLS
alter table public.payments enable row level security;

-- Users can read their own payment records (to check status)
create policy "Users can read own payments"
  on public.payments for select
  using (email = auth.jwt() ->> 'email');

-- Only service_role can insert/update (webhook writes with service key, not anon key)
-- No insert/update policies for anon — the Edge Function uses the service role key
