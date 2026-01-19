-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Initialize admin security config with default passcode
INSERT INTO public.admin_security_config (id, passcode_hash, admin_email, require_fingerprint, failed_attempts)
VALUES (
  1,
  crypt('noor-admin-1234', gen_salt('bf', 10)),
  'admin@noor.app',
  false,
  0
)
ON CONFLICT (id) DO NOTHING;