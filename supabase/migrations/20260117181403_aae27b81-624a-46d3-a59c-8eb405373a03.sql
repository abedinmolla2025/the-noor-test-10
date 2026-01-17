-- 1) Enum for platform targeting
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'occasion_platform') THEN
    CREATE TYPE public.occasion_platform AS ENUM ('web','app','both');
  END IF;
END $$;

-- 2) Table
CREATE TABLE IF NOT EXISTS public.admin_occasions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  dua_text text NULL,
  image_url text NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  platform public.occasion_platform NOT NULL DEFAULT 'both',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Helpful index for home carousel query
CREATE INDEX IF NOT EXISTS idx_admin_occasions_active_window
ON public.admin_occasions (is_active, start_date, end_date, display_order);

-- 3) Validation + updated_at trigger
CREATE OR REPLACE FUNCTION public.admin_occasions_before_write()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.title IS NULL OR btrim(NEW.title) = '' THEN
    RAISE EXCEPTION 'title_required';
  END IF;

  IF NEW.message IS NULL OR btrim(NEW.message) = '' THEN
    RAISE EXCEPTION 'message_required';
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_admin_occasions_before_write'
  ) THEN
    CREATE TRIGGER trg_admin_occasions_before_write
    BEFORE INSERT OR UPDATE ON public.admin_occasions
    FOR EACH ROW
    EXECUTE FUNCTION public.admin_occasions_before_write();
  END IF;
END $$;

-- 4) RLS
ALTER TABLE public.admin_occasions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Public read only active items within date range
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='admin_occasions' AND policyname='Public can read active occasions'
  ) THEN
    CREATE POLICY "Public can read active occasions"
    ON public.admin_occasions
    FOR SELECT
    USING (
      is_active = true
      AND start_date <= now()
      AND end_date >= now()
    );
  END IF;

  -- Admin full CRUD
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='admin_occasions' AND policyname='Admins can manage occasions'
  ) THEN
    CREATE POLICY "Admins can manage occasions"
    ON public.admin_occasions
    FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));
  END IF;
END $$;

-- 5) Storage bucket for occasion images/gifs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'occasions-assets') THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('occasions-assets', 'occasions-assets', true);
  END IF;
END $$;

-- Public read bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects' AND policyname='Occasions assets are publicly readable'
  ) THEN
    CREATE POLICY "Occasions assets are publicly readable"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'occasions-assets');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins can upload occasion assets'
  ) THEN
    CREATE POLICY "Admins can upload occasion assets"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'occasions-assets' AND is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins can update occasion assets'
  ) THEN
    CREATE POLICY "Admins can update occasion assets"
    ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'occasions-assets' AND is_admin(auth.uid()))
    WITH CHECK (bucket_id = 'occasions-assets' AND is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins can delete occasion assets'
  ) THEN
    CREATE POLICY "Admins can delete occasion assets"
    ON storage.objects
    FOR DELETE
    USING (bucket_id = 'occasions-assets' AND is_admin(auth.uid()));
  END IF;
END $$;

-- 6) Seed data (Bangla titles) - only if table is empty
DO $$
DECLARE
  cnt integer;
BEGIN
  SELECT count(*) INTO cnt FROM public.admin_occasions;
  IF cnt = 0 THEN
    INSERT INTO public.admin_occasions (title, message, dua_text, image_url, start_date, end_date, is_active, display_order, platform)
    VALUES
      ('Eid Mubarak', 'ঈদ মোবারক! আল্লাহ আপনার পরিবারে শান্তি ও বরকত দান করুন।', 'তাকাব্বালাল্লাহু মিন্না ওয়া মিনকুম', NULL, now() - interval '1 day', now() + interval '20 days', true, 1, 'both'),
      ('Jumuah Mubarak', 'জুম্মা মুবারক! আজকের দিনটি ইবাদত ও দোয়ার জন্য বিশেষ।', 'আল্লাহুম্মা সাল্লি আলা মুহাম্মাদ', NULL, now() - interval '1 day', now() + interval '20 days', true, 2, 'both'),
      ('Shab-e-Barat', 'শবে বরাতের রাতে আল্লাহর রহমত কামনা করি।', 'ইয়া আল্লাহ, আমাদের গুনাহ মাফ করে দিন', NULL, now() - interval '1 day', now() + interval '20 days', true, 3, 'both'),
      ('Ramadan Kareem', 'রমজান করিম! সিয়াম ও কিয়ামে কাটুক আপনার দিন।', 'আল্লাহুম্মা ইন্নাকা আফুউন তুহিব্বুল আফওয়া ফা’ফু আন্নি', NULL, now() - interval '1 day', now() + interval '20 days', true, 4, 'both'),
      ('Milad-un-Nabi', 'মিলাদুন্নবী মুবারক! দরুদ ও সালাম বৃদ্ধি করি।', 'সাল্লাল্লাহু আলাইহি ওয়া সাল্লাম', NULL, now() - interval '1 day', now() + interval '20 days', true, 5, 'both');
  END IF;
END $$;
