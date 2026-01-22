-- Create a public bucket for generated name share images
INSERT INTO storage.buckets (id, name, public)
VALUES ('name-shares', 'name-shares', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to objects in this bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public read name share images'
  ) THEN
    CREATE POLICY "Public read name share images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'name-shares');
  END IF;
END $$;