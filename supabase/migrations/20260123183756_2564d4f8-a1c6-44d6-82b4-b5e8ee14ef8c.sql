-- Ensure admin security config is initialized (required by admin-security backend function)

INSERT INTO public.admin_security_config (
  id,
  admin_email,
  passcode_hash,
  require_fingerprint,
  failed_attempts,
  locked_until,
  updated_at
)
VALUES (
  1,
  'admin@noor.app',
  crypt('noor-admin-1234', gen_salt('bf', 10)),
  false,
  0,
  NULL,
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Seed passcode history so reuse checks work
INSERT INTO public.admin_passcode_history (passcode_hash)
SELECT passcode_hash
FROM public.admin_security_config
WHERE id = 1
  AND passcode_hash IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.admin_passcode_history);
