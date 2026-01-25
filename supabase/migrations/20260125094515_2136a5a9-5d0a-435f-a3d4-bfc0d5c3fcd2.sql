-- Modify set_admin_passcode to handle both INSERT (bootstrap) and UPDATE
-- This fixes the "null value in passcode_hash violates not-null constraint" error
CREATE OR REPLACE FUNCTION public.set_admin_passcode(new_passcode text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF new_passcode IS NULL OR length(trim(new_passcode)) < 6 OR length(new_passcode) > 128 THEN
    RETURN false;
  END IF;

  -- Use INSERT ... ON CONFLICT UPDATE (upsert) to handle both bootstrap and updates
  INSERT INTO public.admin_security_config (id, admin_email, passcode_hash, updated_at)
  VALUES (
    1,
    'admin@noor.app',
    crypt(new_passcode, gen_salt('bf', 10)),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    passcode_hash = crypt(new_passcode, gen_salt('bf', 10)),
    updated_at = now();

  RETURN true;
END;
$$;