-- Enable realtime changefeed for app_settings so in-app branding updates (logo/icon/favicon) propagate without requiring a refresh.
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_settings;