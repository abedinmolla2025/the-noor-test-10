ALTER TABLE public.admin_passcode_reset_tokens
ADD COLUMN IF NOT EXISTS code_salt text NOT NULL DEFAULT '';

-- Backfill any existing rows
UPDATE public.admin_passcode_reset_tokens
SET code_salt = ''
WHERE code_salt IS NULL;