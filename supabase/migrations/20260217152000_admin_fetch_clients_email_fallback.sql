-- Admin fetch hardening:
-- Include intake/diagnostic rows by client_id OR email match so legacy/orphan rows
-- still appear in Admin profile.

CREATE OR REPLACE FUNCTION public.admin_fetch_all_clients()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_agg(row_to_json(t))
  INTO result
  FROM (
    SELECT
      c.id,
      c.email,
      c.first_name,
      c.business_name,
      c.website,
      c.created_at,
      c.updated_at,
      COALESCE(
        (
          SELECT json_agg(row_to_json(ir) ORDER BY ir.created_at DESC)
          FROM intake_responses ir
          WHERE ir.client_id = c.id
             OR lower(ir.email) = lower(c.email)
        ),
        '[]'::json
      ) AS intake_responses,
      COALESCE(
        (
          SELECT json_agg(row_to_json(dr) ORDER BY dr.created_at DESC)
          FROM diagnostic_results dr
          WHERE dr.client_id = c.id
             OR lower(dr.email) = lower(c.email)
        ),
        '[]'::json
      ) AS diagnostic_results,
      COALESCE(
        (
          SELECT json_agg(row_to_json(an) ORDER BY an.created_at DESC)
          FROM admin_notes an
          WHERE an.client_id = c.id
        ),
        '[]'::json
      ) AS admin_notes
    FROM clients c
    ORDER BY c.created_at DESC
  ) t;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_fetch_all_clients() TO anon;
GRANT EXECUTE ON FUNCTION public.admin_fetch_all_clients() TO authenticated;
