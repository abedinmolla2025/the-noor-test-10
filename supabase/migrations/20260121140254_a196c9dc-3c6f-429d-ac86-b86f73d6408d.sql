-- Store per-announcement ticker styling (font, size, color, etc.)
ALTER TABLE public.admin_notifications
  ADD COLUMN IF NOT EXISTS ticker_style jsonb NULL;

CREATE INDEX IF NOT EXISTS idx_admin_notifications_ticker_style ON public.admin_notifications USING GIN (ticker_style);
