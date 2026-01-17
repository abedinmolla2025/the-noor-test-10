-- Phase 2: Admin-controlled page builder sections

CREATE TABLE IF NOT EXISTS public.admin_page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  section_key text NOT NULL,
  title text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  platform text NOT NULL DEFAULT 'all', -- web | app | all
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Common access patterns: load visible sections for a page/platform ordered by position
CREATE INDEX IF NOT EXISTS idx_admin_page_sections_page_platform_position
  ON public.admin_page_sections(page, platform, position);

CREATE INDEX IF NOT EXISTS idx_admin_page_sections_page_visible
  ON public.admin_page_sections(page, visible);

-- Prevent duplicate section slots for a given page/platform
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'admin_page_sections_page_platform_section_key_uniq'
  ) THEN
    ALTER TABLE public.admin_page_sections
      ADD CONSTRAINT admin_page_sections_page_platform_section_key_uniq
      UNIQUE (page, platform, section_key);
  END IF;
END $$;

-- updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_admin_page_sections_updated_at'
  ) THEN
    CREATE TRIGGER set_admin_page_sections_updated_at
    BEFORE UPDATE ON public.admin_page_sections
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.admin_page_sections ENABLE ROW LEVEL SECURITY;

-- Admin full access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='admin_page_sections' AND policyname='Admins manage page sections'
  ) THEN
    CREATE POLICY "Admins manage page sections"
    ON public.admin_page_sections
    FOR ALL
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
  END IF;
END $$;

-- Public can read only visible sections
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='admin_page_sections' AND policyname='Public reads visible page sections'
  ) THEN
    CREATE POLICY "Public reads visible page sections"
    ON public.admin_page_sections
    FOR SELECT
    USING (visible = true);
  END IF;
END $$;

-- Seed default home layout (idempotent)
INSERT INTO public.admin_page_sections (page, section_key, title, position, visible, settings, platform)
SELECT * FROM (
  VALUES
    ('home', 'banner', 'Banner', 0, true, '{}'::jsonb, 'all'),
    ('home', 'dua', 'Dua', 1, true, '{"gridColumns":2,"cardSize":"md","styleVariant":"default"}'::jsonb, 'all'),
    ('home', 'hadith', 'Hadith', 2, true, '{"cardSize":"md","styleVariant":"default"}'::jsonb, 'all'),
    ('home', 'tasbih', 'Tasbih', 3, true, '{"cardSize":"md","styleVariant":"default"}'::jsonb, 'all'),
    ('home', 'ads_1', 'Ad Slot', 4, true, '{"adPlacement":"web_home_top","styleVariant":"default"}'::jsonb, 'all')
) AS v(page, section_key, title, position, visible, settings, platform)
WHERE NOT EXISTS (
  SELECT 1 FROM public.admin_page_sections s
  WHERE s.page = v.page AND s.platform = v.platform AND s.section_key = v.section_key
);
