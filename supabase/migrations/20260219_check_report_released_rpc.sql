-- RPC to check if a report has been released for a given client email.
-- Uses SECURITY DEFINER to bypass RLS on admin_notes, since clients
-- need to read this but shouldn't have direct access to admin_notes.

CREATE OR REPLACE FUNCTION public.check_report_released(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client_id uuid;
  v_released boolean := false;
BEGIN
  SELECT id INTO v_client_id
  FROM clients
  WHERE email = lower(p_email)
  LIMIT 1;

  IF v_client_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM admin_notes
    WHERE client_id = v_client_id
      AND note LIKE '%[report-released]%'
  ) INTO v_released;

  RETURN v_released;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_report_released(text) TO anon;
GRANT EXECUTE ON FUNCTION public.check_report_released(text) TO authenticated;
