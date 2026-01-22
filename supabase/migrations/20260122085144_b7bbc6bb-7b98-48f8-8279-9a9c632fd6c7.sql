-- Seed admin security config if missing (required by admin-security backend function)
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
  extensions.crypt('noor-admin-1234', extensions.gen_salt('bf', 10)),
  false,
  0,
  NULL,
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Seed passcode history once (helps reuse-check RPC)
INSERT INTO public.admin_passcode_history (passcode_hash)
SELECT c.passcode_hash
FROM public.admin_security_config c
WHERE c.id = 1
  AND NOT EXISTS (SELECT 1 FROM public.admin_passcode_history);
