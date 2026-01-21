import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type InAppNotification = {
  id: string;
  title: string;
  message: string;
  scheduled_at: string | null;
  expires_at?: string | null;
  ticker_style?: any;
  ticker_active?: boolean;
  sent_at: string | null;
  status: string | null;
  created_at: string | null;
};

export function useInAppNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["in-app-notifications"],
    queryFn: async () => {
      const nowIso = new Date().toISOString();

      const { data, error } = await (supabase.from("admin_notifications") as any)
        .select(
          "id, title, message, scheduled_at, expires_at, ticker_style, ticker_active, sent_at, status, created_at",
        )
        .eq("ticker_active", true)
        .in("status", ["sent", "scheduled"])
        .or(`scheduled_at.is.null,scheduled_at.lte.${nowIso}`)
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
        .order("scheduled_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false, nullsFirst: false })
        .limit(50);

      if (error) throw error;
      return (data ?? []) as InAppNotification[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("in-app-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_notifications" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["in-app-notifications"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const sorted = useMemo(() => {
    const items = query.data ?? [];
    return items.slice().sort((a, b) => {
      const ta = new Date(a.scheduled_at ?? a.sent_at ?? a.created_at ?? 0).getTime();
      const tb = new Date(b.scheduled_at ?? b.sent_at ?? b.created_at ?? 0).getTime();
      return tb - ta;
    });
  }, [query.data]);

  return { ...query, data: sorted };
}
