-- Enable pgcrypto extension for password hashing functions (gen_salt, crypt)
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- Update set_admin_passcode to use pgcrypto from extensions schema
CREATE OR REPLACE FUNCTION public.set_admin_passcode(new_passcode text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
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
    extensions.crypt(new_passcode, extensions.gen_salt('bf', 10)),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    passcode_hash = extensions.crypt(new_passcode, extensions.gen_salt('bf', 10)),
    updated_at = now();

  RETURN true;
END;
$$;

-- Also update update_admin_passcode to use extensions schema
CREATE OR REPLACE FUNCTION public.update_admin_passcode(new_passcode text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
BEGIN
  IF new_passcode IS NULL OR length(trim(new_passcode)) < 6 OR length(new_passcode) > 128 THEN
    RETURN false;
  END IF;

  UPDATE public.admin_security_config
  SET passcode_hash = extensions.crypt(new_passcode, extensions.gen_salt('bf', 10)),
      updated_at = now()
  WHERE id = 1;

  RETURN true;
END;
$$;