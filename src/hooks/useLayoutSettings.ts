import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { LayoutPlatform } from "@/lib/layout";

export type LayoutSettingRow = Tables<"admin_layout_settings">;

export function useLayoutSettings(layoutKey: string, platform: LayoutPlatform) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["layout-settings", layoutKey, platform],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_layout_settings")
        .select("*")
        .eq("layout_key", layoutKey)
        .eq("platform", platform)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return (data ?? []) as LayoutSettingRow[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel(`layout-settings:${layoutKey}:${platform}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_layout_settings" },
        (payload) => {
          const row = payload.new as Partial<LayoutSettingRow> | null;
          // Best-effort filter (realtime filters are limited)
          if (row?.layout_key && row.layout_key !== layoutKey) return;
          if (row?.platform && row.platform !== platform) return;
          queryClient.invalidateQueries({ queryKey: ["layout-settings", layoutKey, platform] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [layoutKey, platform, queryClient]);

  return query;
}
