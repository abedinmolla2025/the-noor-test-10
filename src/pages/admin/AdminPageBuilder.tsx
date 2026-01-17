import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { GripVertical, Loader2, Save } from "lucide-react";

type PlatformFilter = "web" | "app";

type AdminPageSection = {
  id: string;
  page: string;
  section_key: string;
  title: string;
  position: number;
  visible: boolean;
  settings: Record<string, any>;
  platform: "web" | "app" | "all";
  created_at: string;
  updated_at: string;
};

type SectionSettings = {
  gridColumns?: number;
  cardSize?: "sm" | "md" | "lg";
  adPlacement?: string;
  styleVariant?: "default" | "soft" | "glass";
};

function normalizeSettings(raw: any): SectionSettings {
  if (!raw || typeof raw !== "object") return {};
  return raw as SectionSettings;
}

function SortableRow({
  item,
  onToggleVisible,
  onSaveSettings,
}: {
  item: AdminPageSection;
  onToggleVisible: (id: string, next: boolean) => void;
  onSaveSettings: (id: string, settings: SectionSettings) => Promise<void>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as const;

  const [draft, setDraft] = useState<SectionSettings>(() => normalizeSettings(item.settings));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveSettings(item.id, draft);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        "flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-3 " +
        (isDragging ? "opacity-80" : "")
      }
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium">{item.title || item.section_key}</p>
            <Badge variant="outline">{item.section_key}</Badge>
            <Badge variant="secondary">{item.platform}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Position: {item.position}</p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Visible</span>
          <Switch checked={item.visible} onCheckedChange={(v) => onToggleVisible(item.id, v)} />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              Settings
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>{item.title || item.section_key}</SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-5">
              <div className="space-y-2">
                <Label>Grid columns</Label>
                <Select
                  value={String(draft.gridColumns ?? 2)}
                  onValueChange={(v) => setDraft((s) => ({ ...s, gridColumns: Number(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Card size</Label>
                <Select
                  value={draft.cardSize ?? "md"}
                  onValueChange={(v) => setDraft((s) => ({ ...s, cardSize: v as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Style variant</Label>
                <Select
                  value={draft.styleVariant ?? "default"}
                  onValueChange={(v) => setDraft((s) => ({ ...s, styleVariant: v as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="soft">Soft</SelectItem>
                    <SelectItem value="glass">Glass</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ad placement (for ad sections)</Label>
                <Input
                  value={draft.adPlacement ?? ""}
                  onChange={(e) => setDraft((s) => ({ ...s, adPlacement: e.target.value }))}
                  placeholder="web_home_top"
                />
                <p className="text-xs text-muted-foreground">
                  Only used when section_key is an ad slot (e.g. ads_1).
                </p>
              </div>

              <Button onClick={handleSave} className="w-full gap-2" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save settings
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

export default function AdminPageBuilder() {
  const { toast } = useToast();
  const [platform, setPlatform] = useState<PlatformFilter>("web");
  const [items, setItems] = useState<AdminPageSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const load = async () => {
    setLoading(true);
    try {
      // Load both the platform-specific rows + "all" rows, then sort by position.
      const { data, error } = await supabase
        .from("admin_page_sections")
        .select("*")
        .eq("page", "home")
        .in("platform", ["all", platform])
        .order("position", { ascending: true });
      if (error) throw error;
      setItems((data ?? []) as any);
    } catch (e: any) {
      toast({ title: "Failed to load page sections", description: e?.message ?? "", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const orderedIds = useMemo(() => items.map((i) => i.id), [items]);

  const persistOrder = async (next: AdminPageSection[]) => {
    setSavingOrder(true);
    try {
      // Persist positions as 0..n in the current visible list order
      const updates = next.map((row, idx) => ({ id: row.id, position: idx }));
      // Supabase supports upsert; but for clarity use update per row.
      await Promise.all(
        updates.map((u) => supabase.from("admin_page_sections").update({ position: u.position }).eq("id", u.id)),
      );
      toast({ title: "Order saved" });
    } catch (e: any) {
      toast({ title: "Failed to save order", description: e?.message ?? "", variant: "destructive" });
    } finally {
      setSavingOrder(false);
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(items, oldIndex, newIndex).map((r, idx) => ({ ...r, position: idx }));
    setItems(next);
    await persistOrder(next);
  };

  const onToggleVisible = async (id: string, nextVisible: boolean) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, visible: nextVisible } : p)));
    const { error } = await supabase.from("admin_page_sections").update({ visible: nextVisible }).eq("id", id);
    if (error) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
      // revert
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, visible: !nextVisible } : p)));
    }
  };

  const onSaveSettings = async (id: string, settings: SectionSettings) => {
    const { error } = await supabase
      .from("admin_page_sections")
      .update({ settings })
      .eq("id", id);
    if (error) {
      toast({ title: "Failed to save settings", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Settings saved" });
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, settings } : p)));
  };

  // initial + reload on platform
  useState(() => {
    void load();
  });

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Home Page Builder</h1>
            <p className="text-sm text-muted-foreground">Drag to reorder, toggle visibility, edit section settings.</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select value={platform} onValueChange={(v) => setPlatform(v as PlatformFilter)}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web">Web</SelectItem>
                <SelectItem value="app">App</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={load} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Refresh
            </Button>
            <Button variant="outline" onClick={() => persistOrder(items)} disabled={savingOrder || !items.length}>
              {savingOrder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save order
            </Button>
          </div>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Sections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && !items.length ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : null}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {items.map((item) => (
                  <SortableRow
                    key={item.id}
                    item={item}
                    onToggleVisible={onToggleVisible}
                    onSaveSettings={onSaveSettings}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {!loading && items.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">No sections configured for home.</div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
