import { useEffect, useMemo, useState } from "react";
import { Reorder } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { GripVertical, History, RotateCcw } from "lucide-react";
import type { LayoutPlatform } from "@/lib/layout";
import { detectLayoutPlatform } from "@/lib/layout";
import { useLayoutSettings } from "@/hooks/useLayoutSettings";

type UiSize = "compact" | "normal" | "large";

type UiSection = {
  section_key: string;
  label: string;
  visible: boolean;
  order_index: number;
  size: UiSize;
};

const LAYOUT_KEY = "home";

const DEFAULT_SECTIONS: Array<Pick<UiSection, "section_key" | "label">> = [
  { section_key: "prayer_hero", label: "Prayer hero" },
  { section_key: "feature_icons", label: "Feature icons" },
  { section_key: "ad_home_top", label: "Home ad slot" },
  { section_key: "focus_zone", label: "Audio + Quiz" },
  { section_key: "daily_hadith", label: "Daily hadith" },
  { section_key: "footer", label: "Footer" },
];

function toUiSections(rows: any[], fallback = DEFAULT_SECTIONS): UiSection[] {
  if (!rows?.length) {
    return fallback.map((s, i) => ({
      ...s,
      visible: true,
      order_index: i,
      size: "normal",
    }));
  }

  const map = new Map<string, any>(rows.map((r) => [r.section_key, r]));
  const fromDb = rows
    .slice()
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((r) => ({
      section_key: r.section_key,
      label: fallback.find((f) => f.section_key === r.section_key)?.label ?? r.section_key,
      visible: r.visible ?? true,
      order_index: r.order_index ?? 0,
      size: (r.size as UiSize) || "normal",
    }));

  // Ensure any new defaults appear even if not in DB yet
  const missing = fallback
    .filter((f) => !map.has(f.section_key))
    .map((f, idx) => ({
      section_key: f.section_key,
      label: f.label,
      visible: true,
      order_index: fromDb.length + idx,
      size: "normal" as UiSize,
    }));

  return [...fromDb, ...missing].map((s, i) => ({ ...s, order_index: i }));
}

export default function AdminLayoutControl() {
  const [platform, setPlatform] = useState<LayoutPlatform>("web");
  const [items, setItems] = useState<UiSection[]>(() => toUiSections([]));
  const [busy, setBusy] = useState(false);

  const layoutSettingsQuery = useLayoutSettings(LAYOUT_KEY, platform);

  useEffect(() => {
    detectLayoutPlatform().then(setPlatform).catch(() => setPlatform("web"));
  }, []);

  useEffect(() => {
    const rows = layoutSettingsQuery.data ?? [];
    setItems(toUiSections(rows as any[]));
  }, [layoutSettingsQuery.data, platform]);

  const isInitialized = (layoutSettingsQuery.data?.length ?? 0) > 0;

  const versionsQueryKey = useMemo(() => ["layout-versions", LAYOUT_KEY, platform], [platform]);

  const loadVersions = async () => {
    const { data, error } = await supabase
      .from("admin_layout_settings_versions")
      .select("*")
      .eq("layout_key", LAYOUT_KEY)
      .eq("platform", platform)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) throw error;
    return data ?? [];
  };

  const [versions, setVersions] = useState<any[]>([]);

  useEffect(() => {
    loadVersions().then(setVersions).catch(() => setVersions([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, isInitialized]);

  const persist = async (nextItems: UiSection[], { snapshot }: { snapshot: boolean }) => {
    setBusy(true);
    try {
      const normalized = nextItems.map((s, i) => ({ ...s, order_index: i }));

      // Replace to avoid duplicates even if unique constraint isn't present
      const del = await supabase
        .from("admin_layout_settings")
        .delete()
        .eq("layout_key", LAYOUT_KEY)
        .eq("platform", platform);
      if (del.error) throw del.error;

      const insertPayload = normalized.map((s) => ({
        layout_key: LAYOUT_KEY,
        platform,
        section_key: s.section_key,
        visible: s.visible,
        order_index: s.order_index,
        size: s.size,
      }));

      const ins = await supabase.from("admin_layout_settings").insert(insertPayload);
      if (ins.error) throw ins.error;

      if (snapshot) {
        const ver = await supabase.from("admin_layout_settings_versions").insert({
          layout_key: LAYOUT_KEY,
          platform,
          snapshot: insertPayload,
        });
        if (ver.error) throw ver.error;
        loadVersions().then(setVersions).catch(() => setVersions([]));
      }

      toast.success("Layout updated");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to update layout");
    } finally {
      setBusy(false);
    }
  };

  const handlePublish = async () => {
    await persist(items, { snapshot: true });
  };

  const handleInitialize = async () => {
    const defaults = toUiSections([]);
    setItems(defaults);
    await persist(defaults, { snapshot: true });
  };

  const handleSyncFromPageBuilder = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_page_sections")
        .select("section_key,title,position,visible,platform")
        .eq("page", LAYOUT_KEY)
        .in("platform", ["all", platform])
        .order("position", { ascending: true });

      if (error) throw error;

      const rows = data ?? [];
      if (rows.length === 0) {
        toast.error("No Page Builder sections found to sync");
        return;
      }

      const synced: UiSection[] = rows.map((r, i) => ({
        section_key: r.section_key,
        label: r.title || r.section_key,
        visible: r.visible ?? true,
        order_index: i,
        size: "normal",
      }));

      setItems(synced);
      await persist(synced, { snapshot: true });
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to sync from Page Builder");
    }
  };

  const handleRestore = async (snapshot: any) => {
    const rows = Array.isArray(snapshot) ? snapshot : [];
    const restored = toUiSections(
      rows.map((r, i) => ({
        section_key: r.section_key,
        visible: r.visible ?? true,
        order_index: r.order_index ?? i,
        size: r.size ?? "normal",
      })),
    );

    setItems(restored);
    await persist(restored, { snapshot: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold">Layout Control</h1>
          <p className="text-sm text-muted-foreground">
            Drag to reorder, toggle visibility, choose size, then publish. Applies in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-40">
            <Label className="text-xs">Platform</Label>
            <Select value={platform} onValueChange={(v) => setPlatform(v as LayoutPlatform)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web">Web</SelectItem>
                <SelectItem value="app">Mobile app</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={handleSyncFromPageBuilder} disabled={busy}>
            Sync from Page Builder
          </Button>

          <Button onClick={handlePublish} disabled={busy}>
            Publish
          </Button>
        </div>
      </div>

      {!isInitialized && (
        <Card className="p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Initialize layout</p>
              <p className="text-xs text-muted-foreground">
                No saved layout found for this platform. Create a default configuration.
              </p>
            </div>
            <Button variant="outline" onClick={handleInitialize} disabled={busy}>
              Create defaults
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-3">
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={(next) => setItems(next.map((s, i) => ({ ...s, order_index: i })))}
          className="space-y-2"
        >
          {items.map((item) => (
            <Reorder.Item
              key={item.section_key}
              value={item}
              className="rounded-xl border border-border bg-card p-3"
            >
              <div className="flex items-center gap-3">
                <div className="cursor-grab text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground">{item.section_key}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-32">
                    <Select
                      value={item.size}
                      onValueChange={(v) =>
                        setItems((prev) =>
                          prev.map((p) =>
                            p.section_key === item.section_key ? { ...p, size: v as UiSize } : p,
                          ),
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Show</Label>
                    <Switch
                      checked={item.visible}
                      onCheckedChange={(checked) =>
                        setItems((prev) =>
                          prev.map((p) =>
                            p.section_key === item.section_key ? { ...p, visible: checked } : p,
                          ),
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium">Rollback (last 5)</p>
        </div>
        <Separator className="my-3" />

        {versions.length === 0 ? (
          <p className="text-xs text-muted-foreground">No snapshots yet.</p>
        ) : (
          <div className="space-y-2">
            {versions.map((v) => (
              <div
                key={v.id}
                className="flex flex-col gap-2 rounded-xl border border-border bg-background/50 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">Snapshot</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(v.created_at).toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestore(v.snapshot)}
                  disabled={busy}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Restore
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
