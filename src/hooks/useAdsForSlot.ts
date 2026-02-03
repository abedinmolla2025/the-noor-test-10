import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AdPlacement, AdPlatform } from "@/lib/ads";

export type AdRow = {
  id: string;
  title: string;
  ad_type?: string;
  ad_code?: string;
  image_path: string | null;
  link_url: string | null;
  button_text: string | null;
  placement: string | null;
  target_platform: string;
  priority: number;
  start_at: string | null;
  end_at: string | null;
  status: string;
  show_after_n_items: number | null;
  frequency_per_session: number | null;
  max_daily_views: number | null;
};

export function useAdsForSlot(params: {
  platform: AdPlatform;
  placement: AdPlacement;
  sessionId: string;
  limit?: number;
  enabled?: boolean;
}) {
  const { platform, placement, sessionId, limit = 1, enabled = true } = params;

  return useQuery({
    queryKey: ["ads-slot", platform, placement, sessionId, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("fetch_ads_for_slot", {
        _platform: platform,
        _placement: placement,
        _session_id: sessionId,
        _limit: limit,
      });

      if (error) throw error;
      return (data ?? []) as AdRow[];
    },
    enabled,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}
