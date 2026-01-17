import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { LayoutPlatform } from "@/lib/layout";

export type PageBuilderPlatform = "web" | "app";

export type PageSectionRow = {
  id: string;
  page: string;
  section_key: string;
  title: string;
  position: number;
  visible: boolean;
  settings: Record<string, any>;
  platform: "web" | "app" | "all";
};

function mapLayoutPlatformToPageBuilderPlatform(p: LayoutPlatform): PageBuilderPlatform {
  // LayoutPlatform in this codebase is already "web" | "app"
  return p;
}

export function usePageSections(page: string, layoutPlatform: LayoutPlatform) {
  const platform = useMemo(() => mapLayoutPlatformToPageBuilderPlatform(layoutPlatform), [layoutPlatform]);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<PageSectionRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("admin_page_sections")
          .select("id,page,section_key,title,position,visible,settings,platform")
          .eq("page", page)
          .eq("visible", true)
          .in("platform", ["all", platform])
          .order("position", { ascending: true });

        if (error) throw error;
        if (!cancelled) setRows((data ?? []) as any);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load page layout");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [page, platform]);

  return { loading, rows, error, platform };
}
