-- Extend notification delivery logs for richer Web Push diagnostics
ALTER TABLE public.notification_deliveries
  ADD COLUMN IF NOT EXISTS subscription_id uuid NULL,
  ADD COLUMN IF NOT EXISTS subscription_endpoint text NULL,
  ADD COLUMN IF NOT EXISTS endpoint_host text NULL,
  ADD COLUMN IF NOT EXISTS browser text NULL,
  ADD COLUMN IF NOT EXISTS stage text NULL;

-- Helpful indexes for history/analytics
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_notification_id ON public.notification_deliveries(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_status ON public.notification_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_endpoint_host ON public.notification_deliveries(endpoint_host);
