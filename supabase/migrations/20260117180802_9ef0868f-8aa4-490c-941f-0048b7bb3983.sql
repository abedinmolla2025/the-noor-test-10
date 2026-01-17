-- Allow larger web push subscription payloads in device_push_tokens.token
-- (PushSubscription JSON can exceed 512 chars)

DO $$
BEGIN
  -- Replace policy with a more permissive token length upper bound
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'device_push_tokens'
      AND policyname = 'Public can register push tokens'
  ) THEN
    DROP POLICY "Public can register push tokens" ON public.device_push_tokens;
  END IF;
END $$;

CREATE POLICY "Public can register push tokens"
ON public.device_push_tokens
FOR INSERT
WITH CHECK (
  (platform = ANY (ARRAY['android'::text, 'ios'::text, 'web'::text]))
  AND (length(token) >= 20 AND length(token) <= 4096)
  AND (device_id IS NULL OR (length(device_id) >= 8 AND length(device_id) <= 128))
  AND (user_id IS NULL OR user_id = auth.uid())
);
