-- Create storage bucket for splash screens if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('splash-screens', 'splash-screens', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for splash-screens bucket
DO $$
BEGIN
  -- Allow public to read splash screen files
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public can view splash screens'
  ) THEN
    CREATE POLICY "Public can view splash screens"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'splash-screens');
  END IF;

  -- Allow admins to upload splash screens
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Admins can upload splash screens'
  ) THEN
    CREATE POLICY "Admins can upload splash screens"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'splash-screens'
      AND EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('super_admin', 'admin')
      )
    );
  END IF;

  -- Allow admins to update splash screens
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Admins can update splash screens'
  ) THEN
    CREATE POLICY "Admins can update splash screens"
    ON storage.objects
    FOR UPDATE
    USING (
      bucket_id = 'splash-screens'
      AND EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('super_admin', 'admin')
      )
    );
  END IF;

  -- Allow admins to delete splash screens
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Admins can delete splash screens'
  ) THEN
    CREATE POLICY "Admins can delete splash screens"
    ON storage.objects
    FOR DELETE
    USING (
      bucket_id = 'splash-screens'
      AND EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('super_admin', 'admin')
      )
    );
  END IF;
END $$;