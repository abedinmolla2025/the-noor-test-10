-- 1) Passcode history table (stores bcrypt hashes)
CREATE TABLE IF NOT EXISTS public.admin_passcode_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  passcode_hash TEXT NOT NULL
);

-- Lock down by default
ALTER TABLE public.admin_passcode_history ENABLE ROW LEVEL SECURITY;

-- 2) Extend admin_security_config with lockout state (idempotent)
ALTER TABLE public.admin_security_config
  ADD COLUMN IF NOT EXISTS passcode_hash TEXT;

ALTER TABLE public.admin_security_config
  ADD COLUMN IF NOT EXISTS failed_attempts INT NOT NULL DEFAULT 0;

ALTER TABLE public.admin_security_config
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

-- Helpful index for fetching last N hashes quickly
CREATE INDEX IF NOT EXISTS idx_admin_passcode_history_created_at
  ON public.admin_passcode_history (created_at DESC);
