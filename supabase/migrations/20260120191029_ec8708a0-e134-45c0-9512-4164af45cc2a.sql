-- Passcode reset tokens (server-managed)
CREATE TABLE IF NOT EXISTS public.admin_passcode_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email text NOT NULL,
  code_hash text NOT NULL,
  requested_ip text NULL,
  requested_user_id uuid NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_admin_passcode_reset_tokens_email_created
  ON public.admin_passcode_reset_tokens (admin_email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_passcode_reset_tokens_expires
  ON public.admin_passcode_reset_tokens (expires_at);

-- Protect table with RLS (no direct client access)
ALTER TABLE public.admin_passcode_reset_tokens ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'admin_passcode_reset_tokens'
      AND policyname = 'deny_all_admin_passcode_reset_tokens'
  ) THEN
    CREATE POLICY deny_all_admin_passcode_reset_tokens
    ON public.admin_passcode_reset_tokens
    FOR ALL
    USING (false)
    WITH CHECK (false);
  END IF;
END $$;

-- Cleanup helper: keep table from growing unbounded (optional)
CREATE OR REPLACE FUNCTION public.trim_admin_passcode_reset_tokens()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- delete tokens older than 7 days or already used
  DELETE FROM public.admin_passcode_reset_tokens
  WHERE created_at < (now() - interval '7 days')
     OR used_at IS NOT NULL;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'tr_trim_admin_passcode_reset_tokens'
  ) THEN
    CREATE TRIGGER tr_trim_admin_passcode_reset_tokens
    AFTER INSERT ON public.admin_passcode_reset_tokens
    FOR EACH STATEMENT
    EXECUTE FUNCTION public.trim_admin_passcode_reset_tokens();
  END IF;
END $$;