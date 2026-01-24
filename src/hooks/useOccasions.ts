import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type OccasionPlatform = "web" | "app" | "both";

export type AdminOccasionRow = {
  id: string;
  title: string;
  message: string;
  dua_text: string | null;
  image_url: string | null;
  card_css?: string | null;
  container_class_name?: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  display_order: number;
  platform: OccasionPlatform;
  created_at: string;
  updated_at: string;
};

export function useActiveOccasions(platform: "web" | "app") {
  return useQuery({
    queryKey: ["active-occasions", platform],
    queryFn: async (): Promise<AdminOccasionRow[]> => {
      const nowIso = new Date().toISOString();
      const platforms = platform === "web" ? ["web", "both"] : ["app", "both"];

      const { data, error } = await (supabase as any)
        .from("admin_occasions")
        .select(
          "id,title,message,subtitle,html_code,css_code,dua_text,image_url,card_css,container_class_name,start_date,end_date,is_active,display_order,platform",
        )
        .eq("is_active", true)
        .lte("start_date", nowIso)
        .gte("end_date", nowIso)
        .in("platform", platforms)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;
      return (data ?? []) as any;
    },
  });
}
