-- RPC to fetch the most recent intake answers for a client by email.
-- Used by FullReport when a returning client has no in-memory intakeData.
-- SECURITY DEFINER bypasses RLS on intake_responses so anon/authenticated
-- can retrieve their own answers without direct table access.

CREATE OR REPLACE FUNCTION public.fetch_intake_by_email(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_answers jsonb;
BEGIN
  SELECT ir.answers
  INTO v_answers
  FROM intake_responses ir
  WHERE ir.email = lower(p_email)
  ORDER BY ir.created_at DESC
  LIMIT 1;

  RETURN v_answers;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fetch_intake_by_email(text) TO anon;
GRANT EXECUTE ON FUNCTION public.fetch_intake_by_email(text) TO authenticated;
