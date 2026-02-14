-- Migration: Add 'full' payment type for single $1,200 payment model
-- Run this in Supabase SQL Editor before deploying the updated webhook

ALTER TABLE public.payments
  DROP CONSTRAINT payments_payment_type_check;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_payment_type_check
  CHECK (payment_type IN ('deposit', 'balance', 'full'));
