-- Harden email-based RPC lookups:
-- - Normalize both sides with lower(trim(...))
-- - Prefer most recently updated pack when duplicates exist

CREATE OR REPLACE FUNCTION public.get_question_pack_status(p_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status text;
BEGIN
  SELECT qp.status
  INTO v_status
  FROM question_packs qp
  JOIN clients c ON c.id = qp.client_id
  WHERE lower(trim(c.email)) = lower(trim(p_email))
  ORDER BY qp.updated_at DESC
  LIMIT 1;

  RETURN COALESCE(v_status, 'none');
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_question_pack_status(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_question_pack_status(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_shipped_question_pack(p_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT row_to_json(t)
  INTO result
  FROM (
    SELECT qp.questions, qp.pack_meta
    FROM question_packs qp
    JOIN clients c ON c.id = qp.client_id
    WHERE lower(trim(c.email)) = lower(trim(p_email))
      AND qp.status IN ('shipped', 'custom')
    ORDER BY qp.updated_at DESC
    LIMIT 1
  ) t;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_shipped_question_pack(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_shipped_question_pack(text) TO authenticated;

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
  WHERE lower(trim(ir.email)) = lower(trim(p_email))
  ORDER BY ir.created_at DESC
  LIMIT 1;

  RETURN v_answers;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fetch_intake_by_email(text) TO anon;
GRANT EXECUTE ON FUNCTION public.fetch_intake_by_email(text) TO authenticated;
