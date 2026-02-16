-- Report Overrides: Allow admin to manually edit report sections before releasing to clients
-- Each row is one section override for one client

CREATE TABLE IF NOT EXISTS public.report_overrides (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  section_key text NOT NULL,
  custom_content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(client_id, section_key)
);

-- RLS: deny direct access, use SECURITY DEFINER RPCs
ALTER TABLE public.report_overrides ENABLE ROW LEVEL SECURITY;

-- ─── Save or update an override ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_save_report_override(
  p_client_id uuid,
  p_section_key text,
  p_content text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO report_overrides (client_id, section_key, custom_content, updated_at)
  VALUES (p_client_id, p_section_key, p_content, now())
  ON CONFLICT (client_id, section_key)
  DO UPDATE SET custom_content = EXCLUDED.custom_content, updated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_save_report_override(uuid, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.admin_save_report_override(uuid, text, text) TO authenticated;

-- ─── Delete an override (revert to auto-generated) ───────────────
CREATE OR REPLACE FUNCTION public.admin_delete_report_override(
  p_client_id uuid,
  p_section_key text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM report_overrides
  WHERE client_id = p_client_id AND section_key = p_section_key;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_report_override(uuid, text) TO anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_report_override(uuid, text) TO authenticated;

-- ─── Fetch all overrides for a client ────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_get_report_overrides(p_client_id uuid)
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
    SELECT section_key, custom_content, updated_at
    FROM report_overrides
    WHERE client_id = p_client_id
    ORDER BY section_key
  ) t;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_report_overrides(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.admin_get_report_overrides(uuid) TO authenticated;

-- ─── Fetch overrides for client-facing report (by email) ─────────
CREATE OR REPLACE FUNCTION public.get_report_overrides_by_email(p_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  v_client_id uuid;
BEGIN
  SELECT id INTO v_client_id FROM clients WHERE email = lower(p_email) LIMIT 1;
  IF v_client_id IS NULL THEN
    RETURN '[]'::json;
  END IF;

  SELECT json_agg(row_to_json(t))
  INTO result
  FROM (
    SELECT section_key, custom_content
    FROM report_overrides
    WHERE client_id = v_client_id
    ORDER BY section_key
  ) t;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_report_overrides_by_email(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_report_overrides_by_email(text) TO authenticated;
