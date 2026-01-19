-- Create notification templates table
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  deep_link TEXT,
  target_platform TEXT NOT NULL DEFAULT 'all',
  category TEXT NOT NULL DEFAULT 'custom',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT notification_templates_name_check CHECK (char_length(trim(name)) > 0 AND char_length(name) <= 100),
  CONSTRAINT notification_templates_title_check CHECK (char_length(trim(title)) > 0 AND char_length(title) <= 200),
  CONSTRAINT notification_templates_body_check CHECK (char_length(trim(body)) > 0 AND char_length(body) <= 1000),
  CONSTRAINT notification_templates_platform_check CHECK (target_platform IN ('all', 'android', 'ios', 'web')),
  CONSTRAINT notification_templates_category_check CHECK (category IN ('prayer', 'daily', 'special', 'custom'))
);

-- Enable RLS
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- Admin users can view all templates
CREATE POLICY "Admins can view all templates"
ON public.notification_templates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'super_admin')
  )
);

-- Admin users can create templates
CREATE POLICY "Admins can create templates"
ON public.notification_templates
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'super_admin')
  )
  AND auth.uid() = created_by
);

-- Admin users can update their own templates
CREATE POLICY "Admins can update own templates"
ON public.notification_templates
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'super_admin')
  )
  AND auth.uid() = created_by
);

-- Admin users can delete their own templates
CREATE POLICY "Admins can delete own templates"
ON public.notification_templates
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'super_admin')
  )
  AND auth.uid() = created_by
);

-- Trigger for updated_at
CREATE TRIGGER update_notification_templates_updated_at
BEFORE UPDATE ON public.notification_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_notification_templates_created_by ON public.notification_templates(created_by);
CREATE INDEX idx_notification_templates_category ON public.notification_templates(category);