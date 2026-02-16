-- Allow admin to delete a specific admin note (e.g., to unmark delivered)
CREATE OR REPLACE FUNCTION public.admin_delete_note(p_note_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM admin_notes WHERE id = p_note_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_note(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_note(uuid) TO authenticated;
