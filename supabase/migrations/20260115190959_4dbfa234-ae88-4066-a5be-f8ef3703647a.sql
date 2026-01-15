-- Add safe bootstrap RPCs so migrations don't require triggers on auth.users

CREATE OR REPLACE FUNCTION public.ensure_profile_and_user_role()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create profile if missing
  INSERT INTO public.profiles (id)
  VALUES (v_uid)
  ON CONFLICT (id) DO NOTHING;

  -- Ensure at least the default role exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_uid, 'user'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_profile_and_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_profile_and_user_role() TO authenticated;


CREATE OR REPLACE FUNCTION public.bootstrap_first_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid;
  v_has_any_super boolean;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.user_roles WHERE role = 'super_admin'::public.app_role
  ) INTO v_has_any_super;

  IF v_has_any_super THEN
    RETURN false;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_uid, 'super_admin'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.bootstrap_first_super_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bootstrap_first_super_admin() TO authenticated;
