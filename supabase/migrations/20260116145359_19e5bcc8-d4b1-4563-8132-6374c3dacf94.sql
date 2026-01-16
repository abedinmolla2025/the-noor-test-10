-- 1) Unified Ad placements + targets
-- Extend existing admin_ads table to support unified web/app placements and richer creative fields.

ALTER TABLE public.admin_ads
  ADD COLUMN IF NOT EXISTS placement text,
  ADD COLUMN IF NOT EXISTS target_platform text DEFAULT 'all' NOT NULL,
  ADD COLUMN IF NOT EXISTS image_path text,
  ADD COLUMN IF NOT EXISTS link_url text,
  ADD COLUMN IF NOT EXISTS button_text text,
  ADD COLUMN IF NOT EXISTS show_after_n_items integer,
  ADD COLUMN IF NOT EXISTS frequency_per_session integer,
  ADD COLUMN IF NOT EXISTS max_daily_views integer;

-- Backfill placement/target_platform from legacy columns
UPDATE public.admin_ads
SET placement = COALESCE(placement, zone),
    target_platform = COALESCE(target_platform, CASE
      WHEN platform IN ('web','android','ios') THEN platform
      WHEN platform IN ('both') THEN 'all'
      ELSE 'all'
    END)
WHERE placement IS NULL OR target_platform IS NULL;

-- Keep legacy columns for backward compatibility, but align them
UPDATE public.admin_ads
SET zone = COALESCE(zone, placement),
    platform = CASE
      WHEN target_platform IN ('web','android','ios') THEN target_platform
      ELSE 'both'
    END;

-- Update check constraints to include new values.
-- Drop existing constraints if present.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admin_ads_platform_check'
  ) THEN
    ALTER TABLE public.admin_ads DROP CONSTRAINT admin_ads_platform_check;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admin_ads_zone_check'
  ) THEN
    ALTER TABLE public.admin_ads DROP CONSTRAINT admin_ads_zone_check;
  END IF;
END $$;

ALTER TABLE public.admin_ads
  ADD CONSTRAINT admin_ads_platform_check CHECK ((platform = ANY (ARRAY['web'::text, 'android'::text, 'ios'::text, 'both'::text]))),
  ADD CONSTRAINT admin_ads_zone_check CHECK ((zone = ANY (ARRAY[
    'web_home_top'::text,
    'web_dua_middle'::text,
    'web_hadith_middle'::text,
    'web_quran_bottom'::text,
    'web_tasbih_footer'::text,
    'app_home_top'::text,
    'app_dua_middle'::text,
    'app_hadith_middle'::text,
    'app_quran_bottom'::text,
    'app_tasbih_footer'::text,
    'app_interstitial'::text
  ])));

-- Placement/target_platform constraints
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_ads_placement_check') THEN
    ALTER TABLE public.admin_ads DROP CONSTRAINT admin_ads_placement_check;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_ads_target_platform_check') THEN
    ALTER TABLE public.admin_ads DROP CONSTRAINT admin_ads_target_platform_check;
  END IF;
END $$;

ALTER TABLE public.admin_ads
  ADD CONSTRAINT admin_ads_placement_check CHECK ((placement = ANY (ARRAY[
    'web_home_top'::text,
    'web_dua_middle'::text,
    'web_hadith_middle'::text,
    'web_quran_bottom'::text,
    'web_tasbih_footer'::text,
    'app_home_top'::text,
    'app_dua_middle'::text,
    'app_hadith_middle'::text,
    'app_quran_bottom'::text,
    'app_tasbih_footer'::text,
    'app_interstitial'::text
  ]))),
  ADD CONSTRAINT admin_ads_target_platform_check CHECK ((target_platform = ANY (ARRAY['web'::text, 'android'::text, 'ios'::text, 'all'::text])));

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_admin_ads_active_lookup
  ON public.admin_ads (placement, target_platform, status, priority);

-- 2) Kill switch / emergency controls (publicly readable)
CREATE TABLE IF NOT EXISTS public.admin_ad_controls (
  id integer PRIMARY KEY DEFAULT 1,
  web_enabled boolean NOT NULL DEFAULT true,
  app_enabled boolean NOT NULL DEFAULT true,
  kill_switch boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.admin_ad_controls (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.admin_ad_controls ENABLE ROW LEVEL SECURITY;

-- Public can read controls so client can disable ads quickly.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='admin_ad_controls' AND policyname='Public can read ad controls'
  ) THEN
    CREATE POLICY "Public can read ad controls"
    ON public.admin_ad_controls
    FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='admin_ad_controls' AND policyname='Admins can update ad controls'
  ) THEN
    CREATE POLICY "Admins can update ad controls"
    ON public.admin_ad_controls
    FOR UPDATE
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
  END IF;
END $$;

-- 3) Analytics events table
CREATE TABLE IF NOT EXISTS public.ad_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid NOT NULL REFERENCES public.admin_ads(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  platform text NOT NULL,
  placement text NOT NULL,
  session_id text,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ad_events_event_type_check CHECK ((event_type = ANY (ARRAY['impression'::text, 'click'::text])))
);

CREATE INDEX IF NOT EXISTS idx_ad_events_created_at ON public.ad_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_events_ad_id ON public.ad_events (ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_events_platform_placement ON public.ad_events (platform, placement);

ALTER TABLE public.ad_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ad_events' AND policyname='Public can insert ad events'
  ) THEN
    CREATE POLICY "Public can insert ad events"
    ON public.ad_events
    FOR INSERT
    WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ad_events' AND policyname='Admins can read ad events'
  ) THEN
    CREATE POLICY "Admins can read ad events"
    ON public.ad_events
    FOR SELECT
    USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- 4) Storage bucket for ad creatives (public read)
-- NOTE: Only create bucket + policies; do not modify storage internals beyond this.
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-assets', 'ad-assets', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  -- Public read
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Public read ad-assets'
  ) THEN
    CREATE POLICY "Public read ad-assets"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'ad-assets');
  END IF;

  -- Admin manage
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins insert ad-assets'
  ) THEN
    CREATE POLICY "Admins insert ad-assets"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'ad-assets' AND public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins update ad-assets'
  ) THEN
    CREATE POLICY "Admins update ad-assets"
    ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'ad-assets' AND public.is_admin(auth.uid()))
    WITH CHECK (bucket_id = 'ad-assets' AND public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins delete ad-assets'
  ) THEN
    CREATE POLICY "Admins delete ad-assets"
    ON storage.objects
    FOR DELETE
    USING (bucket_id = 'ad-assets' AND public.is_admin(auth.uid()));
  END IF;
END $$;

-- 5) Ensure realtime isn't needed for ads; no publication changes here.