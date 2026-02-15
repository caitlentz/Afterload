-- RPC function to check payment status by email.
-- Uses SECURITY DEFINER to bypass RLS so the anon client can check payments.
-- Returns JSON with payment status fields.

CREATE OR REPLACE FUNCTION public.check_payment_status(lookup_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'deposit_paid', COALESCE(bool_or(payment_type = 'deposit'), false),
    'balance_paid', COALESCE(bool_or(payment_type = 'balance'), false),
    'full_paid', COALESCE(bool_or(payment_type = 'full'), false),
    'deposit_date', MAX(CASE WHEN payment_type = 'deposit' THEN created_at END),
    'balance_date', MAX(CASE WHEN payment_type = 'balance' THEN created_at END),
    'full_date', MAX(CASE WHEN payment_type = 'full' THEN created_at END)
  ) INTO result
  FROM payments
  WHERE email = lower(lookup_email)
    AND status = 'succeeded';

  RETURN COALESCE(result, json_build_object(
    'deposit_paid', false,
    'balance_paid', false,
    'full_paid', false,
    'deposit_date', null,
    'balance_date', null,
    'full_date', null
  ));
END;
$$;

-- Grant execute to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.check_payment_status(text) TO anon;
GRANT EXECUTE ON FUNCTION public.check_payment_status(text) TO authenticated;
