-- Fix verify_admin_passcode failing to find `crypt()` by including the extensions schema.
CREATE OR REPLACE FUNCTION public.verify_admin_passcode(_passcode text, _device_fingerprint text)
RETURNS TABLE(ok boolean, locked_until timestamp with time zone, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, extensions
AS $function$
DECLARE
  cfg public.admin_security_config%ROWTYPE;
  fail_count integer;
  latest_fail timestamptz;
  lock_until timestamptz;
BEGIN
  IF _passcode IS NULL OR length(trim(_passcode)) < 6 OR length(_passcode) > 128 THEN
    ok := false;
    locked_until := NULL;
    reason := 'invalid_passcode_format';
    RETURN NEXT;
    RETURN;
  END IF;

  IF _device_fingerprint IS NULL OR length(trim(_device_fingerprint)) < 10 OR length(_device_fingerprint) > 256 THEN
    ok := false;
    locked_until := NULL;
    reason := 'invalid_fingerprint_format';
    RETURN NEXT;
    RETURN;
  END IF;

  SELECT * INTO cfg FROM public.admin_security_config WHERE id = 1;
  IF NOT FOUND THEN
    ok := false;
    locked_until := NULL;
    reason := 'not_configured';
    RETURN NEXT;
    RETURN;
  END IF;

  -- Lockout: last 10 minutes failed attempts >= 5
  SELECT count(*)
    INTO fail_count
  FROM public.admin_unlock_attempts a
  WHERE a.device_fingerprint = _device_fingerprint
    AND a.success = false
    AND a.created_at > (now() - interval '10 minutes');

  IF fail_count >= 5 THEN
    SELECT max(a.created_at)
      INTO latest_fail
    FROM public.admin_unlock_attempts a
    WHERE a.device_fingerprint = _device_fingerprint
      AND a.success = false;

    lock_until := latest_fail + interval '10 minutes';

    ok := false;
    locked_until := lock_until;
    reason := 'locked_out';

    INSERT INTO public.admin_unlock_attempts (device_fingerprint, success)
    VALUES (_device_fingerprint, false);

    RETURN NEXT;
    RETURN;
  END IF;

  IF extensions.crypt(_passcode, cfg.passcode_hash) = cfg.passcode_hash THEN
    INSERT INTO public.admin_unlock_attempts (device_fingerprint, success)
    VALUES (_device_fingerprint, true);

    ok := true;
    locked_until := NULL;
    reason := 'ok';
    RETURN NEXT;
    RETURN;
  ELSE
    INSERT INTO public.admin_unlock_attempts (device_fingerprint, success)
    VALUES (_device_fingerprint, false);

    ok := false;
    locked_until := NULL;
    reason := 'invalid_passcode';
    RETURN NEXT;
    RETURN;
  END IF;
END;
$function$;
