import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { CalendarDays, GripVertical, Image as ImageIcon, Loader2, Plus, Save, Trash2 } from "lucide-react";

type OccasionPlatform = "web" | "app" | "both";

type OccasionRow = {
  id: string;
  title: string;
  message: string;
  dua_text: string | null;
  image_url: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  display_order: number;
  platform: OccasionPlatform;
  created_at: string;
  updated_at: string;
};

function toLocalStartOfDayIso(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}

function toLocalEndOfDayIso(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x.toISOString();
}

function SortableOccasionRow({
  item,
  onEdit,
  onDelete,
}: {
  item: OccasionRow;
  onEdit: (row: OccasionRow) => void;
  onDelete: (row: OccasionRow) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as const;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        "flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-3 " +
        (isDragging ? "opacity-80" : "")
      }
    >
      <div className="flex min-w-0 items-start gap-3">
        <button
          type="button"
          className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold">{item.title}</p>
            <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
              {item.platform}
            </span>
            {!item.is_active && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">inactive</span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.message}</p>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {new Date(item.start_date).toLocaleString()} → {new Date(item.end_date).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(item)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function AdminOccasions() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin-occasions"],
    queryFn: async (): Promise<OccasionRow[]> => {
      const { data, error } = await (supabase as any)
        .from("admin_occasions")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any;
    },
  });

  const [items, setItems] = useState<OccasionRow[]>([]);
  useEffect(() => setItems(rows), [rows]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<OccasionRow | null>(null);

  const emptyForm = useMemo(
    () => ({
      title: "",
      message: "",
      dua_text: "",
      platform: "both" as OccasionPlatform,
      is_active: true,
      dateRange: undefined as DateRange | undefined,
      imageFile: null as File | null,
      image_url: "",
    }),
    [],
  );

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDateError(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (row: OccasionRow) => {
    setEditing(row);
    setDateError(null);
    setForm({
      ...emptyForm,
      title: row.title ?? "",
      message: row.message ?? "",
      dua_text: row.dua_text ?? "",
      platform: row.platform ?? "both",
      is_active: !!row.is_active,
      image_url: row.image_url ?? "",
      dateRange: {
        from: row.start_date ? new Date(row.start_date) : undefined,
        to: row.end_date ? new Date(row.end_date) : undefined,
      },
      imageFile: null,
    });
    setDialogOpen(true);
  };

  const uploadImageIfNeeded = async () => {
    if (!form.imageFile) return editing?.image_url ?? (form.image_url?.trim() ? form.image_url.trim() : null);

    const path = `occasions/${crypto.randomUUID()}-${form.imageFile.name}`;
    const { error: uploadError } = await supabase.storage.from("occasions-assets").upload(path, form.imageFile, {
      cacheControl: "3600",
      upsert: false,
    });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("occasions-assets").getPublicUrl(path);
    return data.publicUrl;
  };

  const save = async () => {
    setSaving(true);
    try {
      setDateError(null);

      const from = form.dateRange?.from;
      const to = form.dateRange?.to;

      if (!from || !to) {
        setDateError("Start ও End তারিখ নির্বাচন করুন");
        throw new Error("Start & end date required");
      }
      if (to.getTime() < from.getTime()) {
        setDateError("End তারিখ, Start-এর পরে হতে হবে");
        throw new Error("End date must be after start date");
      }

      const startIso = toLocalStartOfDayIso(from);
      const endIso = toLocalEndOfDayIso(to);

      const image_url = await uploadImageIfNeeded();

      const payload: any = {
        title: form.title.trim(),
        message: form.message.trim(),
        dua_text: form.dua_text.trim() ? form.dua_text.trim() : null,
        image_url: image_url ?? null,
        start_date: startIso,
        end_date: endIso,
        is_active: !!form.is_active,
        platform: form.platform,
      };

      if (editing) {
        const { error } = await supabase.from("admin_occasions" as any).update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        // Next order at end
        const nextOrder = (items?.length ?? 0) + 1;
        const { error } = await supabase
          .from("admin_occasions" as any)
          .insert({ ...payload, display_order: nextOrder });
        if (error) throw error;
      }

      await qc.invalidateQueries({ queryKey: ["admin-occasions"] });
      toast({ title: "Saved" });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (e: any) {
      toast({ title: "Failed", description: e?.message ?? "Could not save.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: OccasionRow) => {
    const ok = window.confirm(`Delete “${row.title}”?`);
    if (!ok) return;

    try {
      const { error } = await supabase.from("admin_occasions" as any).delete().eq("id", row.id);
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["admin-occasions"] });
      toast({ title: "Deleted" });
    } catch (e: any) {
      toast({ title: "Failed", description: e?.message ?? "Could not delete.", variant: "destructive" });
    }
  };

  const persistOrder = async (next: OccasionRow[]) => {
    try {
      await Promise.all(
        next.map((row, idx) =>
          supabase.from("admin_occasions" as any).update({ display_order: idx + 1 }).eq("id", row.id),
        ),
      );
      toast({ title: "Order saved" });
    } catch (e: any) {
      toast({ title: "Failed to save order", description: e?.message ?? "", variant: "destructive" });
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(items, oldIndex, newIndex).map((r, idx) => ({ ...r, display_order: idx + 1 }));
    setItems(next);
    await persistOrder(next);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Occasions"
        description="Islamic occasion banners for web + app (carousel on Home)."
        icon={CalendarDays}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit occasion" : "Create occasion"}</DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Message</Label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Dua text (optional)</Label>
                  <Input value={form.dua_text} onChange={(e) => setForm((p) => ({ ...p, dua_text: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={form.platform} onValueChange={(v) => setForm((p) => ({ ...p, platform: v as OccasionPlatform }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Both</SelectItem>
                      <SelectItem value="web">Web</SelectItem>
                      <SelectItem value="app">App</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">Active</p>
                    <p className="text-xs text-muted-foreground">Only active + in date range shows on Home.</p>
                  </div>
                  <Switch checked={form.is_active} onCheckedChange={(v) => setForm((p) => ({ ...p, is_active: v }))} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Date range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !form.dateRange?.from && "text-muted-foreground",
                        )}
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {form.dateRange?.from ? (
                          form.dateRange?.to ? (
                            <>
                              {format(form.dateRange.from, "PPP")} – {format(form.dateRange.to, "PPP")}
                            </>
                          ) : (
                            format(form.dateRange.from, "PPP")
                          )
                        ) : (
                          <span>তারিখ নির্বাচন করুন</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={form.dateRange}
                        onSelect={(range) => {
                          setDateError(null);
                          setForm((p) => ({ ...p, dateRange: range }));
                        }}
                        numberOfMonths={1}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  {dateError ? <p className="text-sm font-medium text-destructive">{dateError}</p> : null}
                  <p className="text-xs text-muted-foreground">Home carousel দেখাতে এই তারিখের মধ্যে থাকতে হবে।</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Image/GIF
                  </Label>
                  <Input
                    type="file"
                    accept="image/*,image/gif"
                    onChange={(e) => setForm((p) => ({ ...p, imageFile: e.target.files?.[0] ?? null }))}
                  />
                  <p className="text-xs text-muted-foreground">Optional. Uploads to storage bucket “occasions-assets”.</p>
                </div>
              </div>

              <DialogFooter className="mt-2">
                <Button onClick={save} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          {isLoading ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">Loading…</CardContent>
            </Card>
          ) : items.length ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {items.map((row) => (
                    <SortableOccasionRow key={row.id} item={row} onEdit={openEdit} onDelete={remove} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No occasions yet. Click “Create”.
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
              <p className="text-sm font-semibold">Preview</p>
              <p className="mt-1 text-xs text-muted-foreground">
                This is roughly how it will look at the top of Home.
              </p>

              <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
                <div className="relative">
                  <div className="h-44 w-full bg-muted" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                  <div className="absolute bottom-0 p-4">
                    <p className="text-lg font-semibold">{(editing ? editing.title : form.title) || "ঈদ মোবারক"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {(editing ? editing.message : form.message) || "আপনার দিন কাটুক আনন্দ ও বরকতে।"}
                    </p>
                    <p className="mt-2 inline-flex rounded-full bg-primary/20 px-3 py-1 text-sm italic">
                      {(editing ? editing.dua_text : form.dua_text) || "তাকাব্বালাল্লাহু মিন্না ওয়া মিনকুম"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
