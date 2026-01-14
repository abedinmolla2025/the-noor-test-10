-- Add Bangla pronunciation field for duas
ALTER TABLE public.admin_content
ADD COLUMN IF NOT EXISTS content_pronunciation text;