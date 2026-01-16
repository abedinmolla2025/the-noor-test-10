-- Public read access for in-app notifications (scheduled)

-- Ensure realtime emits notification changes
DO $$
BEGIN
  -- publication add can error if already added; wrap in exception handler
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;
  EXCEPTION WHEN duplicate_object THEN
    -- ignore
    NULL;
  END;
END $$;

-- Add indexes for faster feeds
CREATE INDEX IF NOT EXISTS admin_notifications_sent_at_idx ON public.admin_notifications (sent_at DESC);
CREATE INDEX IF NOT EXISTS admin_notifications_scheduled_at_idx ON public.admin_notifications (scheduled_at DESC);

-- Public can read notifications that are ready to show
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_notifications' AND policyname = 'Public can read sent/scheduled notifications'
  ) THEN
    CREATE POLICY "Public can read sent/scheduled notifications"
    ON public.admin_notifications
    FOR SELECT
    USING (
      (
        status IN ('sent','scheduled')
        AND (scheduled_at IS NULL OR scheduled_at <= now())
      )
    );
  END IF;
END $$;