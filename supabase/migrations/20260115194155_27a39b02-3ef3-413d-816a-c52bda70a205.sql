-- Secure admin protection system (passcode + fingerprint + lockout)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Admin security configuration (single row)
CREATE TABLE IF NOT EXISTS public.admin_security_config (
  id integer PRIMARY KEY DEFAULT 1,
  admin_email text NOT NULL DEFAULT 'admin@noor.local',
  passcode_hash text NOT NULL,
  require_fingerprint boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Default passcode (MUST be changed in /admin/security)
INSERT INTO public.admin_security_config (id, admin_email, passcode_hash, require_fingerprint)
VALUES (1, 'admin@noor.local', crypt('noor-admin-1234', gen_salt('bf', 10)), false)
ON CONFLICT (id) DO NOTHING;

-- Unlock attempts (for lockout tracking)
CREATE TABLE IF NOT EXISTS public.admin_unlock_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  device_fingerprint text NOT NULL,
  success boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS admin_unlock_attempts_fingerprint_time_idx
  ON public.admin_unlock_attempts (device_fingerprint, created_at DESC);

-- RPC: verify_admin_passcode(passcode, device_fingerprint)
CREATE OR REPLACE FUNCTION public.verify_admin_passcode(
  passcode text,
  device_fingerprint text
)
RETURNS TABLE (
  ok boolean,
  locked_until timestamptz,
  reason text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cfg public.admin_security_config%ROWTYPE;
  fail_count integer;
  latest_fail timestamptz;
  lock_until timestamptz;
BEGIN
  IF passcode IS NULL OR length(trim(passcode)) < 6 OR length(passcode) > 128 THEN
    ok := false;
    locked_until := NULL;
    reason := 'invalid_passcode_format';
    RETURN NEXT;
    RETURN;
  END IF;

  IF device_fingerprint IS NULL OR length(trim(device_fingerprint)) < 10 OR length(device_fingerprint) > 256 THEN
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
  FROM public.admin_unlock_attempts
  WHERE device_fingerprint = verify_admin_passcode.device_fingerprint
    AND success = false
    AND created_at > (now() - interval '10 minutes');

  IF fail_count >= 5 THEN
    SELECT max(created_at)
      INTO latest_fail
    FROM public.admin_unlock_attempts
    WHERE device_fingerprint = verify_admin_passcode.device_fingerprint
      AND success = false;

    lock_until := latest_fail + interval '10 minutes';

    ok := false;
    locked_until := lock_until;
    reason := 'locked_out';

    INSERT INTO public.admin_unlock_attempts (device_fingerprint, success)
    VALUES (verify_admin_passcode.device_fingerprint, false);

    RETURN NEXT;
    RETURN;
  END IF;

  IF crypt(passcode, cfg.passcode_hash) = cfg.passcode_hash THEN
    INSERT INTO public.admin_unlock_attempts (device_fingerprint, success)
    VALUES (verify_admin_passcode.device_fingerprint, true);

    ok := true;
    locked_until := NULL;
    reason := 'ok';
    RETURN NEXT;
    RETURN;
  ELSE
    INSERT INTO public.admin_unlock_attempts (device_fingerprint, success)
    VALUES (verify_admin_passcode.device_fingerprint, false);

    ok := false;
    locked_until := NULL;
    reason := 'invalid_passcode';
    RETURN NEXT;
    RETURN;
  END IF;
END;
$$;

-- Lock down tables (no direct client access)
ALTER TABLE public.admin_security_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_unlock_attempts ENABLE ROW LEVEL SECURITY;

-- No RLS policies: only SECURITY DEFINER + backend functions can access.
