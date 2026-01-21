-- Add expiry support for in-app announcements (ticker)
ALTER TABLE public.admin_notifications
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE NULL;

-- Helpful index for fetching active announcements
CREATE INDEX IF NOT EXISTS idx_admin_notifications_expires_at ON public.admin_notifications(expires_at);
