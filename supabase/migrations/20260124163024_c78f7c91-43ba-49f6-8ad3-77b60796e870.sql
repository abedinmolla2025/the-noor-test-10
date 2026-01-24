-- Add HTML/CSS-driven occasion fields
ALTER TABLE public.admin_occasions
  ADD COLUMN IF NOT EXISTS subtitle TEXT,
  ADD COLUMN IF NOT EXISTS html_code TEXT,
  ADD COLUMN IF NOT EXISTS css_code TEXT;

-- Optional: backfill from legacy columns to keep existing occasions working
UPDATE public.admin_occasions
SET
  subtitle = COALESCE(subtitle, message),
  css_code = COALESCE(css_code, card_css)
WHERE subtitle IS NULL OR css_code IS NULL;