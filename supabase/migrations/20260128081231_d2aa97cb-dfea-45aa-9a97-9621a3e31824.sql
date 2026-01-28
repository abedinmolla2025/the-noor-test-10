-- Ensure app_settings behaves like a singleton-per-key config table
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Enforce one row per setting_key so upsert() works predictably
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'app_settings'
      AND indexname = 'app_settings_setting_key_key'
  ) THEN
    CREATE UNIQUE INDEX app_settings_setting_key_key ON public.app_settings (setting_key);
  END IF;
END $$;

-- Public read access for non-sensitive global config
DROP POLICY IF EXISTS "Public can read global app settings" ON public.app_settings;
CREATE POLICY "Public can read global app settings"
ON public.app_settings
FOR SELECT
USING (setting_key IN ('branding','theme','seo','system','modules'));

-- Admin-only write access
DROP POLICY IF EXISTS "Admins can insert global app settings" ON public.app_settings;
CREATE POLICY "Admins can insert global app settings"
ON public.app_settings
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update global app settings" ON public.app_settings;
CREATE POLICY "Admins can update global app settings"
ON public.app_settings
FOR UPDATE
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete global app settings" ON public.app_settings;
CREATE POLICY "Admins can delete global app settings"
ON public.app_settings
FOR DELETE
USING (public.is_admin(auth.uid()));
