-- Create table for multiple splash screens with scheduling
CREATE TABLE IF NOT EXISTS public.admin_splash_screens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  lottie_url TEXT NOT NULL,
  duration INTEGER DEFAULT 3000,
  fade_out_duration INTEGER DEFAULT 500,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  platform TEXT DEFAULT 'both' CHECK (platform IN ('web', 'app', 'both')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.admin_splash_screens ENABLE ROW LEVEL SECURITY;

-- Allow public read access for active splash screens
CREATE POLICY "Public can view active splash screens"
ON public.admin_splash_screens
FOR SELECT
USING (is_active = true);

-- Allow admins to manage splash screens
CREATE POLICY "Admins can manage splash screens"
ON public.admin_splash_screens
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('super_admin', 'admin')
  )
);

-- Create index for efficient querying
CREATE INDEX idx_splash_screens_active_dates ON public.admin_splash_screens(is_active, start_date, end_date, priority);

-- Create updated_at trigger
CREATE TRIGGER update_admin_splash_screens_updated_at
BEFORE UPDATE ON public.admin_splash_screens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();