import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPageActionsDropdown } from "@/components/admin/AdminPageActionsDropdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
  card_css?: string | null;
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

function toISODateTimeLocal(value: string) {
  // input[type=datetime-local] gives local time without timezone; store as ISO string in UTC
  // simplest: new Date(localString) assumes local timezone.
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

async function compressImageFile(file: File, opts?: { maxDimension?: number; quality?: number }) {
  // Don't recompress GIFs (keep animation)
  if (file.type === "image/gif") return file;
  if (!file.type.startsWith("image/")) return file;

  const maxDimension = opts?.maxDimension ?? 1600;
  const quality = opts?.quality ?? 0.82;

  try {
    const bitmap = await createImageBitmap(file);
    const ratio = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * ratio));
    const height = Math.max(1, Math.round(bitmap.height * ratio));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, width, height);

    const supportsWebp = (() => {
      try {
        return canvas.toDataURL("image/webp").startsWith("data:image/webp");
      } catch {
        return false;
      }
    })();

    const outType = supportsWebp ? "image/webp" : "image/jpeg";

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), outType, quality),
    );

    // If something went wrong, fall back
    if (!blob) return file;

    // If compression didn't reduce size, keep original
    if (blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "");
    const ext = outType === "image/webp" ? "webp" : "jpg";
    return new File([blob], `${baseName}.${ext}`, { type: outType });
  } catch {
    return file;
  }
}


type OccasionTemplate = {
  id: string;
  label: string;
  style: "minimal" | "festive" | "editorial" | "playful";
  title: string;
  message: string;
  dua_text?: string;
  daysActive?: number;
};

const OCCASION_TEMPLATES: OccasionTemplate[] = [
  {
    id: "eid_festive_1",
    label: "Eid Mubarak — Festive",
    style: "festive",
    title: "ঈদ মোবারক",
    message: "আপনার ঈদ হোক আনন্দ, রহমত ও বরকতে ভরা।",
    dua_text: "তাকাব্বালাল্লাহু মিন্না ওয়া মিনকুম",
    daysActive: 3,
  },
  {
    id: "ramadan_editorial_1",
    label: "Ramadan Kareem — Editorial",
    style: "editorial",
    title: "রমজান কারীম",
    message: "এই মাস হোক তিলাওয়াত, ইবাদত ও আত্মশুদ্ধির নতুন শুরু।",
    dua_text: "আল্লাহুম্মা বারিক লানা ফি রমাদান",
    daysActive: 30,
  },
  {
    id: "jumuah_minimal_1",
    label: "Jumu'ah — Minimal",
    style: "minimal",
    title: "জুমু'আ মোবারক",
    message: "আজকের দিনটি কাটুক দোয়া, দরুদ ও নেক আমলে।",
    dua_text: "আল্লাহুম্মা সল্লি আলা মুহাম্মাদ",
    daysActive: 1,
  },
  {
    id: "shabebarat_festive_1",
    label: "Shab-e-Barat — Festive",
    style: "festive",
    title: "শবে বরাত",
    message: "ক্ষমা ও মাগফিরাতের রাত—আসুন তাওবা ও ইস্তিগফারে মন দিই।",
    dua_text: "রব্বিগফিরলি ওয়ারহামনি",
    daysActive: 2,
  },
  {
    id: "milad_editorial_1",
    label: "Milad-un-Nabi — Editorial",
    style: "editorial",
    title: "মিলাদুন্নবী ﷺ",
    message: "সুন্নাহর আলোয় জীবন সাজাই—দরুদে মুখর হোক হৃদয়।",
    dua_text: "সাল্লাল্লাহু আলাইহি ওয়া সাল্লাম",
    daysActive: 3,
  },
  {
    id: "dua_minimal_1",
    label: "Daily Dua — Minimal",
    style: "minimal",
    title: "আজকের দোয়া",
    message: "একটু থামুন—দোয়ার মাধ্যমে আল্লাহর কাছে চাইুন হেদায়াত ও শান্তি।",
    dua_text: "রব্বানা আতিনা ফিদ্দুনিয়া হাসানাহ",
    daysActive: 7,
  },
  {
    id: "quran_editorial_1",
    label: "Qur'an Reminder — Editorial",
    style: "editorial",
    title: "কুরআন রিমাইন্ডার",
    message: "প্রতিদিন কিছু আয়াত—হৃদয়কে রাখুন নূরের সাথে সংযুক্ত।",
    dua_text: "ইহদিনাস সিরাতাল মুস্তাকীম",
    daysActive: 7,
  },
  {
    id: "charity_playful_1",
    label: "Sadaqah — Playful",
    style: "playful",
    title: "সদকা জারিয়া",
    message: "আজ ছোট্ট একটা সাহায্য—কারও জীবনে বড় হাসি হয়ে ফিরবে।",
    dua_text: "আল্লাহুম্মা তকাব্বাল মিন্না",
    daysActive: 10,
  },
  {
    id: "learning_playful_1",
    label: "Learn Sunnah — Playful",
    style: "playful",
    title: "সুন্নাহ শিখি",
    message: "আজ একটি সুন্নাহ—কাল এক অভ্যাস। ধীরে ধীরে বদলে যাক জীবন।",
    daysActive: 14,
  },
  {
    id: "gratitude_minimal_1",
    label: "Gratitude — Minimal",
    style: "minimal",
    title: "আলহামদুলিল্লাহ",
    message: "যা আছে তার জন্য শোকর—আর যা চাই তার জন্য দোয়া।",
    dua_text: "আলহামদুলিল্লাহি আলা কুল্লি হাল",
    daysActive: 7,
  },
];

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
            {item.card_css?.trim() ? (
              <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                css
              </span>
            ) : null}
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
      templateStyle: null as OccasionTemplate["style"] | null,
      imageFile: null as File | null,
      image_url: "",
      card_css: "",
    }),
    [],
  );

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<string>("");
  const [templateImages, setTemplateImages] = useState<Record<string, string>>({});
  const [templatePhotoUploading, setTemplatePhotoUploading] = useState(false);
  const templatePhotoInputRef = useRef<HTMLInputElement | null>(null);
  const [previewPlatform, setPreviewPlatform] = useState<"web" | "app">("web");
  const [localImagePreviewUrl, setLocalImagePreviewUrl] = useState<string | null>(null);


  useEffect(() => {
    let cancelled = false;

    const loadTemplateImages = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("app_settings")
          .select("setting_value")
          .eq("setting_key", "occasion_template_images")
          .maybeSingle();

        if (error) throw error;
        const value = (data?.setting_value ?? {}) as any;
        const map = value && typeof value === "object" ? (value as Record<string, string>) : {};
        if (!cancelled) setTemplateImages(map);
      } catch {
        if (!cancelled) setTemplateImages({});
      }
    };

    void loadTemplateImages();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (localImagePreviewUrl) URL.revokeObjectURL(localImagePreviewUrl);
    };
  }, [localImagePreviewUrl]);

  const applyBlankTemplate = () => {
    setForm((p) => ({
      ...p,
      title: "",
      message: "",
      dua_text: "",
      dateRange: undefined,
      templateStyle: null,
      imageFile: null,
      image_url: "",
    }));

    if (localImagePreviewUrl) URL.revokeObjectURL(localImagePreviewUrl);
    setLocalImagePreviewUrl(null);
  };

  const applyTemplate = (id: string) => {
    const tpl = OCCASION_TEMPLATES.find((t) => t.id === id);
    if (!tpl) return;

    const today = new Date();
    const to = new Date(today);
    to.setDate(to.getDate() + Math.max(0, (tpl.daysActive ?? 7) - 1));

    const tplImage = templateImages[id];

    setForm((p) => ({
      ...p,
      title: tpl.title,
      message: tpl.message,
      dua_text: tpl.dua_text ?? "",
      dateRange: { from: today, to },
      templateStyle: tpl.style,
      // if a template image exists, prefill it (still optional)
      image_url: typeof tplImage === "string" ? tplImage : p.image_url,
      imageFile: null,
    }));

    if (localImagePreviewUrl) URL.revokeObjectURL(localImagePreviewUrl);
    setLocalImagePreviewUrl(null);
  };

  const getTemplateStyleLabel = (s: OccasionTemplate["style"]) => {
    switch (s) {
      case "minimal":
        return "Minimal";
      case "festive":
        return "Festive";
      case "editorial":
        return "Editorial";
      case "playful":
        return "Playful";
      default:
        return "Template";
    }
  };

  const getPreviewVariant = (s: OccasionTemplate["style"] | null) => {
    if (!s) {
      return {
        frame: "rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-accent/10",
        banner: "bg-muted",
        overlay: "bg-gradient-to-t from-background/90 via-background/30 to-transparent",
        badge: "border-border bg-background/70 text-foreground",
        title: "text-lg font-semibold",
        message: "text-sm text-muted-foreground",
        dua: "bg-primary/20 text-foreground",
      };
    }

    const common = {
      title: "text-lg font-semibold",
      message: "text-sm",
      dua: "text-sm italic",
    };

    switch (s) {
      case "minimal":
        return {
          frame: "rounded-2xl border border-border bg-background",
          banner: "bg-muted",
          overlay: "bg-gradient-to-t from-background/95 via-background/40 to-transparent",
          badge: "border-border bg-muted text-muted-foreground",
          title: cn(common.title, "tracking-tight"),
          message: cn(common.message, "text-muted-foreground"),
          dua: cn(common.dua, "bg-muted text-foreground"),
        };
      case "festive":
        return {
          frame: "rounded-2xl border border-border bg-gradient-to-br from-primary/15 via-background to-accent/15",
          banner: "bg-gradient-to-br from-primary/20 via-muted to-accent/20",
          overlay: "bg-gradient-to-t from-background/85 via-background/25 to-transparent",
          badge: "border-border bg-primary/20 text-foreground",
          title: cn(common.title, "tracking-tight"),
          message: cn(common.message, "text-muted-foreground"),
          dua: cn(common.dua, "bg-primary/20 text-foreground"),
        };
      case "editorial":
        return {
          frame: "rounded-2xl border border-border bg-background",
          banner: "bg-gradient-to-br from-muted via-background to-muted",
          overlay: "bg-gradient-to-t from-background/95 via-background/35 to-transparent",
          badge: "border-border bg-background/80 text-foreground",
          title: "text-xl font-semibold tracking-tight",
          message: "text-sm text-muted-foreground",
          dua: "bg-accent/20 text-foreground text-sm italic",
        };
      case "playful":
        return {
          frame: "rounded-3xl border border-border bg-gradient-to-br from-accent/15 via-background to-primary/10",
          banner: "bg-gradient-to-br from-accent/25 via-muted to-primary/15",
          overlay: "bg-gradient-to-t from-background/90 via-background/25 to-transparent",
          badge: "border-border bg-accent/25 text-foreground",
          title: cn(common.title, "tracking-tight"),
          message: cn(common.message, "text-muted-foreground"),
          dua: cn(common.dua, "bg-accent/20 text-foreground"),
        };
    }
  };

  const openCreate = () => {
    setEditing(null);
    setDateError(null);
    setTemplateId("");
    setLocalImagePreviewUrl(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (row: OccasionRow) => {
    setEditing(row);
    setDateError(null);
    setTemplateId("");
    setLocalImagePreviewUrl(null);
    setForm({
      ...emptyForm,
      title: row.title ?? "",
      message: row.message ?? "",
      dua_text: row.dua_text ?? "",
      platform: row.platform ?? "both",
      is_active: !!row.is_active,
      image_url: row.image_url ?? "",
      card_css: (row.card_css as any) ?? "",
      dateRange: {
        from: row.start_date ? new Date(row.start_date) : undefined,
        to: row.end_date ? new Date(row.end_date) : undefined,
      },
      templateStyle: null,
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

  const uploadTemplatePhoto = async (id: string, file: File) => {
    setTemplatePhotoUploading(true);
    try {
      const optimized = await compressImageFile(file);
      const path = `occasion-templates/${id}/${crypto.randomUUID()}-${optimized.name}`;

      const { error: uploadError } = await supabase.storage.from("occasions-assets").upload(path, optimized, {
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("occasions-assets").getPublicUrl(path);
      const url = data.publicUrl;

      const nextMap = { ...templateImages, [id]: url };
      setTemplateImages(nextMap);

      const { error: upsertErr } = await (supabase as any)
        .from("app_settings")
        .upsert(
          {
            setting_key: "occasion_template_images",
            setting_value: nextMap,
            description: "Occasion template image URLs (by template id)",
          },
          { onConflict: "setting_key" },
        );
      if (upsertErr) throw upsertErr;

      // Also prefill current form image_url so user sees it immediately
      setForm((p) => ({ ...p, image_url: url, imageFile: null }));
      if (localImagePreviewUrl) URL.revokeObjectURL(localImagePreviewUrl);
      setLocalImagePreviewUrl(null);

      toast({ title: "Template photo saved" });
    } catch (e: any) {
      toast({ title: "Failed", description: e?.message ?? "Could not upload template photo.", variant: "destructive" });
    } finally {
      setTemplatePhotoUploading(false);
    }
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
        card_css: form.card_css?.trim() ? form.card_css.trim() : null,
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AdminPageHeader
          title="Occasions"
          description="Islamic occasion banners for web + app (carousel on Home)."
          icon={CalendarDays}
          actions={
            <AdminPageActionsDropdown
              onCreate={openCreate}
              exportData={items}
              onRefresh={() => qc.invalidateQueries({ queryKey: ["admin-occasions"] })}
            />
          }
        />

        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit occasion" : "Create occasion"}</DialogTitle>
          </DialogHeader>

               <div className="grid gap-4 md:grid-cols-2">
                 <div className="space-y-2 md:col-span-2">
                   <Label>Template (optional)</Label>
                   <div className="flex flex-col gap-2 sm:flex-row">
                     <Select
                       value={templateId}
                       onValueChange={(v) => {
                         setTemplateId(v);
                         setDateError(null);
                         if (v === "blank") {
                           applyBlankTemplate();
                         } else {
                           applyTemplate(v);
                         }
                       }}
                     >
                       <SelectTrigger className="sm:w-[320px]">
                         <SelectValue placeholder="Choose a template" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="blank">Blank (custom)</SelectItem>
                         {OCCASION_TEMPLATES.map((t) => (
                           <SelectItem key={t.id} value={t.id}>
                             {t.label}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                     <Button
                       type="button"
                       variant="outline"
                       disabled={!templateId}
                       onClick={() => {
                         setDateError(null);
                         if (templateId === "blank") applyBlankTemplate();
                         else applyTemplate(templateId);
                       }}
                     >
                       Apply
                     </Button>
                   </div>

                   {templateId && templateId !== "blank" ? (
                     <div className="mt-3 rounded-lg border border-border p-3">
                       <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                         <div className="min-w-0">
                           <p className="text-sm font-medium">Template photo (optional)</p>
                           <p className="text-xs text-muted-foreground">
                             এই টেমপ্লেট সিলেক্ট করলে এই ফটোটা auto-fill হবে। চাইলে পরে Image/GIF ফিল্ড থেকে override করতে পারবেন।
                           </p>
                         </div>
                         <div className="flex items-center gap-2">
                           <span className="text-xs text-muted-foreground">
                             {templateImages[templateId] ? "Saved" : "Not set"}
                           </span>
                         </div>
                       </div>

                       <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                         <Input
                           ref={templatePhotoInputRef}
                           type="file"
                           accept="image/*,image/gif"
                           disabled={templatePhotoUploading}
                           onChange={(e) => {
                             const f = e.target.files?.[0];
                             if (!f) return;
                             void uploadTemplatePhoto(templateId, f);
                             // allow re-selecting same file later
                             e.currentTarget.value = "";
                           }}
                         />
                         <Button
                           type="button"
                           variant="outline"
                           disabled={templatePhotoUploading}
                           className="gap-2"
                           onClick={() => templatePhotoInputRef.current?.click()}
                         >
                           {templatePhotoUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                           {templatePhotoUploading ? "Uploading…" : "Upload"}
                         </Button>
                       </div>
                     </div>
                   ) : null}

                   <p className="text-xs text-muted-foreground">
                     টেমপ্লেট সিলেক্ট করলে Title/Message/Dua + Date range auto-fill হবে।
                   </p>
                 </div>

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
                    Image/GIF (optional)
                  </Label>
                  <Input
                    type="file"
                    accept="image/*,image/gif"
                    onChange={async (e) => {
                      const raw = e.target.files?.[0] ?? null;
                      if (!raw) {
                        setForm((p) => ({ ...p, imageFile: null }));
                        if (localImagePreviewUrl) URL.revokeObjectURL(localImagePreviewUrl);
                        setLocalImagePreviewUrl(null);
                        return;
                      }

                      setImageProcessing(true);
                      try {
                        const optimized = await compressImageFile(raw);
                        setForm((p) => ({ ...p, imageFile: optimized, image_url: "" }));

                        // Local preview for UI only
                        if (localImagePreviewUrl) URL.revokeObjectURL(localImagePreviewUrl);
                        setLocalImagePreviewUrl(URL.createObjectURL(optimized));
                      } finally {
                        setImageProcessing(false);
                      }
                    }}
                  />
                  {imageProcessing ? (
                    <p className="text-xs text-muted-foreground">Optimizing image…</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Optional. Leave empty to use template photo (if set) or show a plain banner.
                    </p>
                  )}
                </div>

                 <div className="space-y-2 md:col-span-2">
                   <Label>Card CSS (advanced)</Label>
                   <Textarea
                     value={form.card_css}
                     onChange={(e) => setForm((p) => ({ ...p, card_css: e.target.value }))}
                     rows={6}
                     placeholder={"/* CSS declarations only (no selector) */\nborder-radius: 28px;\ntransform: rotate(-1deg);"}
                   />
                   <p className="text-xs text-muted-foreground">
                     এখানে শুধু CSS declarations লিখুন (selector/braces নয়)। এটা শুধু এই occasion card-এ apply হবে।
                   </p>
                 </div>
              </div>

              <DialogFooter className="mt-2">
                <Button onClick={save} disabled={saving || imageProcessing} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
            {(() => {
              const title = (editing ? editing.title : form.title) || "ঈদ মোবারক";
              const message = (editing ? editing.message : form.message) || "আপনার দিন কাটুক আনন্দ ও বরকতে।";
              const dua = (editing ? editing.dua_text : form.dua_text) || "তাকাব্বালাল্লাহু মিন্না ওয়া মিনকুম";
              const bannerImg = localImagePreviewUrl || form.image_url || editing?.image_url || null;

              const willShowOnSelectedPlatform =
                form.platform === "both" ||
                (form.platform === "web" && previewPlatform === "web") ||
                (form.platform === "app" && previewPlatform === "app");

              return (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">Live preview (Home carousel)</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Homepage এর carousel card-এর exact UI স্টাইলে preview দেখাচ্ছে।
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <ToggleGroup
                        type="single"
                        value={previewPlatform}
                        onValueChange={(v) => {
                          if (v === "web" || v === "app") setPreviewPlatform(v);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <ToggleGroupItem value="web" aria-label="Preview web">
                          Web
                        </ToggleGroupItem>
                        <ToggleGroupItem value="app" aria-label="Preview app">
                          App
                        </ToggleGroupItem>
                      </ToggleGroup>

                      {!willShowOnSelectedPlatform ? (
                        <span className="text-[11px] text-muted-foreground">
                          Note: এই occasion টি {previewPlatform} এ show হবে না (platform={form.platform}).
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Exact same card markup as src/components/OccasionCarousel.tsx */}
                   {(editing?.card_css?.trim() || form.card_css?.trim()) ? (
                     <style>
                       {`.occasion-card[data-occasion-id="preview"]{${(editing?.card_css ?? form.card_css) as string}}`}
                     </style>
                   ) : null}

                   <div
                     className="occasion-card relative overflow-hidden rounded-2xl border border-border bg-card"
                     data-occasion-id="preview"
                   >
                    {bannerImg ? (
                      <img
                        src={bannerImg}
                        alt={title}
                        loading="lazy"
                        className="h-44 w-full object-cover sm:h-52"
                      />
                    ) : (
                      <div className="h-44 w-full bg-muted sm:h-52" />
                    )}

                    {/* Gradient overlay */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/25 via-transparent to-accent/20" />

                    {/* Content */}
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="font-semibold tracking-tight text-foreground text-lg sm:text-xl">{title}</p>
                      <p className="mt-1 text-sm text-foreground/90 line-clamp-2">{message}</p>
                      {dua ? (
                        <p className="mt-2 text-sm italic text-primary-foreground/90 bg-primary/20 inline-flex rounded-full px-3 py-1">
                          {dua}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
