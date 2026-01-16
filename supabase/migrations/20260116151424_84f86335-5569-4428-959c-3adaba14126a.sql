-- Fix migration: constraints may already exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ad_events_event_type_check') THEN
    ALTER TABLE public.ad_events
      ADD CONSTRAINT ad_events_event_type_check
      CHECK (event_type IN ('impression','click'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ad_events_platform_check') THEN
    ALTER TABLE public.ad_events
      ADD CONSTRAINT ad_events_platform_check
      CHECK (platform IN ('web','android','ios'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ad_events_placement_check') THEN
    ALTER TABLE public.ad_events
      ADD CONSTRAINT ad_events_placement_check
      CHECK (
        placement IN (
          'web_home_top','web_dua_middle','web_hadith_middle','web_quran_bottom','web_tasbih_footer',
          'app_home_top','app_dua_middle','app_hadith_middle','app_quran_bottom','app_tasbih_footer','app_interstitial'
        )
      );
  END IF;
END $$;

-- Replace overly-permissive insert policy
DROP POLICY IF EXISTS "Public can insert ad events" ON public.ad_events;

CREATE POLICY "Public can insert ad events"
ON public.ad_events
FOR INSERT
WITH CHECK (
  event_type IN ('impression','click')
  AND platform IN ('web','android','ios')
  AND placement IN (
    'web_home_top','web_dua_middle','web_hadith_middle','web_quran_bottom','web_tasbih_footer',
    'app_home_top','app_dua_middle','app_hadith_middle','app_quran_bottom','app_tasbih_footer','app_interstitial'
  )
  AND session_id IS NOT NULL
  AND length(session_id) BETWEEN 8 AND 128
  AND (user_id IS NULL OR user_id = auth.uid())
);

-- Public RPC to fetch ads for a slot
CREATE OR REPLACE FUNCTION public.fetch_ads_for_slot(
  _platform text,
  _placement text,
  _session_id text,
  _limit integer DEFAULT 1
)
RETURNS SETOF public.admin_ads
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ctl public.admin_ad_controls%ROWTYPE;
BEGIN
  IF _platform IS NULL OR _platform NOT IN ('web','android','ios') THEN
    RETURN;
  END IF;

  IF _placement IS NULL OR _placement NOT IN (
    'web_home_top','web_dua_middle','web_hadith_middle','web_quran_bottom','web_tasbih_footer',
    'app_home_top','app_dua_middle','app_hadith_middle','app_quran_bottom','app_tasbih_footer','app_interstitial'
  ) THEN
    RETURN;
  END IF;

  IF _session_id IS NULL OR length(trim(_session_id)) < 8 OR length(_session_id) > 128 THEN
    RETURN;
  END IF;

  SELECT * INTO ctl FROM public.admin_ad_controls WHERE id = 1;
  IF NOT FOUND THEN
    ctl.kill_switch := false;
    ctl.web_enabled := true;
    ctl.app_enabled := true;
  END IF;

  IF ctl.kill_switch THEN
    RETURN;
  END IF;

  IF _platform = 'web' AND NOT ctl.web_enabled THEN
    RETURN;
  END IF;

  IF _platform IN ('android','ios') AND NOT ctl.app_enabled THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT a.*
  FROM public.admin_ads a
  WHERE a.status = 'active'
    AND (a.start_at IS NULL OR a.start_at <= now())
    AND (a.end_at IS NULL OR a.end_at >= now())
    AND a.placement = _placement
    AND a.target_platform IN (_platform, 'all')
    AND (
      a.max_daily_views IS NULL
      OR (
        SELECT count(*)
        FROM public.ad_events e
        WHERE e.ad_id = a.id
          AND e.event_type = 'impression'
          AND e.created_at::date = current_date
      ) < a.max_daily_views
    )
    AND (
      a.frequency_per_session IS NULL
      OR (
        SELECT count(*)
        FROM public.ad_events e
        WHERE e.ad_id = a.id
          AND e.event_type = 'impression'
          AND e.session_id = _session_id
      ) < a.frequency_per_session
    )
  ORDER BY a.priority DESC, a.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(_limit, 1), 5));
END;
$$;

GRANT EXECUTE ON FUNCTION public.fetch_ads_for_slot(text, text, text, integer) TO anon, authenticated;
