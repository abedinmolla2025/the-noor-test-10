-- Create table for IndexNow API key configuration
CREATE TABLE IF NOT EXISTS public.indexnow_config (
  id SERIAL PRIMARY KEY,
  api_key TEXT NOT NULL,
  host TEXT NOT NULL,
  key_location TEXT,
  last_tested_at TIMESTAMP WITH TIME ZONE,
  test_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.indexnow_config ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write IndexNow config
CREATE POLICY "Admins can manage IndexNow config"
ON public.indexnow_config
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('super_admin', 'admin')
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_indexnow_config_updated_at
BEFORE UPDATE ON public.indexnow_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();