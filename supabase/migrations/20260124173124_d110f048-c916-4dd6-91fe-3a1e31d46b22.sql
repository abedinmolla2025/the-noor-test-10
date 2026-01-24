-- Allow HTML/CSS-driven occasions without requiring the legacy `message` field
ALTER TABLE public.admin_occasions
  ALTER COLUMN message DROP NOT NULL;

-- Update validation trigger to support either legacy text or HTML content
CREATE OR REPLACE FUNCTION public.admin_occasions_before_write()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.title IS NULL OR btrim(NEW.title) = '' THEN
    RAISE EXCEPTION 'title_required';
  END IF;

  -- Require at least one content source:
  -- - subtitle (preferred legacy text)
  -- - message (legacy)
  -- - html_code (new)
  IF (NEW.subtitle IS NULL OR btrim(NEW.subtitle) = '')
     AND (NEW.message IS NULL OR btrim(NEW.message) = '')
     AND (NEW.html_code IS NULL OR btrim(NEW.html_code) = '') THEN
    RAISE EXCEPTION 'content_required';
  END IF;

  -- Keep `message` as a backward-compatible fallback (optional)
  IF (NEW.message IS NULL OR btrim(NEW.message) = '')
     AND (NEW.subtitle IS NOT NULL AND btrim(NEW.subtitle) <> '') THEN
    NEW.message := NEW.subtitle;
  END IF;

  IF NEW.start_date IS NULL OR NEW.end_date IS NULL THEN
    RAISE EXCEPTION 'date_range_required';
  END IF;

  IF NEW.end_date <= NEW.start_date THEN
    RAISE EXCEPTION 'end_date_must_be_after_start_date';
  END IF;

  NEW.updated_at := now();
  IF TG_OP = 'INSERT' THEN
    NEW.created_at := COALESCE(NEW.created_at, now());
  END IF;

  RETURN NEW;
END;
$$;