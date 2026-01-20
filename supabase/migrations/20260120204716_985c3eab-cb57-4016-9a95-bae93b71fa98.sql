-- Add per-language pronunciation/transliteration fields for Duas
ALTER TABLE public.admin_content
ADD COLUMN IF NOT EXISTS content_pronunciation_en text;

ALTER TABLE public.admin_content
ADD COLUMN IF NOT EXISTS content_pronunciation_hi text;

ALTER TABLE public.admin_content
ADD COLUMN IF NOT EXISTS content_pronunciation_ur text;

-- Helpful index for filtering content types (optional)
CREATE INDEX IF NOT EXISTS idx_admin_content_type ON public.admin_content (content_type);
