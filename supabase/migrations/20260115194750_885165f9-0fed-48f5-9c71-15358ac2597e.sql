-- Helper RPC to rotate admin passcode securely (hashing done in DB)

CREATE OR REPLACE FUNCTION public.set_admin_passcode(new_passcode text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF new_passcode IS NULL OR length(trim(new_passcode)) < 6 OR length(new_passcode) > 128 THEN
    RETURN false;
  END IF;

  UPDATE public.admin_security_config
  SET passcode_hash = crypt(new_passcode, gen_salt('bf', 10)),
      updated_at = now()
  WHERE id = 1;

  RETURN true;
END;
$$;