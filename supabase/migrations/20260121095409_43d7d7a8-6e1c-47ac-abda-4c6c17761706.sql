-- Bootstrap admin security config row for remixed projects
-- Ensures admin panel unlock can work out of the box.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_security_config WHERE id = 1
  ) THEN
    INSERT INTO public.admin_security_config (
      id,
      admin_email,
      passcode_hash,
      require_fingerprint,
      failed_attempts,
      locked_until,
      updated_at
    ) VALUES (
      1,
      'admin@noor.app',
      extensions.crypt('noor-admin-1234', extensions.gen_salt('bf', 10)),
      false,
      0,
      NULL,
      now()
    );

    -- Seed passcode history with the initial hash (best-effort)
    INSERT INTO public.admin_passcode_history (passcode_hash)
    SELECT passcode_hash
    FROM public.admin_security_config
    WHERE id = 1;
  END IF;
END $$;
