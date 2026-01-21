-- Add explicit activation flag for in-app announcement ticker
ALTER TABLE public.admin_notifications
ADD COLUMN IF NOT EXISTS ticker_active boolean NOT NULL DEFAULT false;

-- Helpful index for fetching active announcements fast
CREATE INDEX IF NOT EXISTS idx_admin_notifications_ticker_active
ON public.admin_notifications (ticker_active, scheduled_at, sent_at, created_at);
