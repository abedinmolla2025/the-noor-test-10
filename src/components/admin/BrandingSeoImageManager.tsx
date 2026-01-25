import { useMemo, useRef, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ImageCropDialog } from "@/components/admin/ImageCropDialog";

type PresetKey = "carousel_16_9" | "square_1_1" | "favicon_1_1";

const PRESETS: Record<
  PresetKey,
  {
    label: string;
    aspect: number;
    exportSize?: { w: number; h: number };
  }
> = {
  carousel_16_9: { label: "Carousel 16:9", aspect: 16 / 9, exportSize: { w: 1200, h: 675 } },
  square_1_1: { label: "Square 1:1", aspect: 1, exportSize: { w: 1024, h: 1024 } },
  favicon_1_1: { label: "Favicon 1:1", aspect: 1, exportSize: { w: 256, h: 256 } },
};

type Target = "branding" | "seo";

type CropMeta = {
  target: Target;
  field: string;
  title: string;
  preset: PresetKey;
};

function extForBlobType(type: string) {
  if (type === "image/webp") return "webp";
  if (type === "image/jpeg") return "jpg";
  return "png";
}

async function uploadCroppedImage(params: {
  file: File;
  target: Target;
  field: string;
}) {
  const { file, target, field } = params;
  const path = `${target}/${field}/${crypto.randomUUID()}-${file.name}`;

  const { data, error } = await supabase.storage.from("branding").upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });
  if (error) throw error;

  const { data: publicUrlData } = supabase.storage.from("branding").getPublicUrl(data.path);
  return publicUrlData.publicUrl;
}

function ImageSlot(props: {
  title: string;
  description?: string;
  valueUrl?: string;
  preset: PresetKey;
  onPresetChange: (p: PresetKey) => void;
  onPick: (file: File) => void;
  previewShape?: "circle" | "square" | "wide";
}) {
  const { title, description, valueUrl, preset, onPresetChange, onPick, previewShape = "square" } = props;
  const inputRef = useRef<HTMLInputElement | null>(null);

  const previewClass =
    previewShape === "circle"
      ? "h-14 w-14 rounded-full"
      : previewShape === "wide"
        ? "h-20 w-full rounded-xl"
        : "h-14 w-14 rounded-xl";

  return (
    <div className="grid gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold">{title}</p>
          {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
        </div>

        {valueUrl ? (
          <img
            src={valueUrl}
            alt={`${title} preview`}
            className={`${previewClass} border border-border object-cover`}
            loading="lazy"
          />
        ) : (
          <div className={`${previewClass} border border-dashed border-border bg-muted`} />
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="grid gap-2">
          <Label className="text-xs">Crop preset</Label>
          <Select value={preset} onValueChange={(v) => onPresetChange(v as PresetKey)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRESETS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              onPick(file);
              // allow picking the same file again
              e.currentTarget.value = "";
            }}
          />
          <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
            Upload & crop
          </Button>
        </div>
      </div>
    </div>
  );
}

export function BrandingSeoImageManager(props: {
  branding: any;
  setBranding: (updater: any) => void;
  seo: any;
  setSeo: (updater: any) => void;
}) {
  const { branding, setBranding, seo, setSeo } = props;
  const { toast } = useToast();

  const [presetByField, setPresetByField] = useState<Record<string, PresetKey>>({
    logoUrl: "square_1_1",
    iconUrl: "square_1_1",
    faviconUrl: "favicon_1_1",
    shareImageUrl: "carousel_16_9",
  });

  const [cropOpen, setCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropMeta, setCropMeta] = useState<CropMeta | null>(null);
  const [saving, setSaving] = useState(false);

  const activePreset = useMemo(() => {
    if (!cropMeta) return PRESETS.square_1_1;
    return PRESETS[cropMeta.preset];
  }, [cropMeta]);

  const beginCrop = (meta: CropMeta, file: File) => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropMeta(meta);
    setCropSrc(URL.createObjectURL(file));
    setCropOpen(true);
  };

  const commitUrl = (target: Target, field: string, url: string) => {
    if (target === "branding") {
      setBranding((prev: any) => ({ ...prev, [field]: url }));
    } else {
      setSeo((prev: any) => ({ ...prev, [field]: url }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Image Manager</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <ImageSlot
            title="Logo"
            description="Used in app header and branding areas."
            valueUrl={branding.logoUrl}
            previewShape="circle"
            preset={presetByField.logoUrl}
            onPresetChange={(p) => setPresetByField((m) => ({ ...m, logoUrl: p }))}
            onPick={(file) =>
              beginCrop(
                { target: "branding", field: "logoUrl", title: "Crop Logo", preset: presetByField.logoUrl },
                file,
              )
            }
          />

          <ImageSlot
            title="App Icon"
            description="Square icon used inside the app."
            valueUrl={branding.iconUrl}
            previewShape="square"
            preset={presetByField.iconUrl}
            onPresetChange={(p) => setPresetByField((m) => ({ ...m, iconUrl: p }))}
            onPick={(file) =>
              beginCrop(
                { target: "branding", field: "iconUrl", title: "Crop App Icon", preset: presetByField.iconUrl },
                file,
              )
            }
          />

          <ImageSlot
            title="Favicon"
            description="Shown in browser tab. Recommend simple, high-contrast."
            valueUrl={branding.faviconUrl}
            previewShape="square"
            preset={presetByField.faviconUrl}
            onPresetChange={(p) => setPresetByField((m) => ({ ...m, faviconUrl: p }))}
            onPick={(file) =>
              beginCrop(
                { target: "branding", field: "faviconUrl", title: "Crop Favicon", preset: presetByField.faviconUrl },
                file,
              )
            }
          />

          <ImageSlot
            title="Share Image (OG)"
            description="Used when sharing links on social apps."
            valueUrl={seo.shareImageUrl}
            previewShape="wide"
            preset={presetByField.shareImageUrl}
            onPresetChange={(p) => setPresetByField((m) => ({ ...m, shareImageUrl: p }))}
            onPick={(file) =>
              beginCrop(
                {
                  target: "seo",
                  field: "shareImageUrl",
                  title: "Crop Share Image",
                  preset: presetByField.shareImageUrl,
                },
                file,
              )
            }
          />
        </div>

        <ImageCropDialog
          open={cropOpen}
          onOpenChange={(open) => {
            setCropOpen(open);
            if (!open) {
              if (cropSrc) URL.revokeObjectURL(cropSrc);
              setCropSrc(null);
              setCropMeta(null);
            }
          }}
          imageSrc={cropSrc}
          title={cropMeta?.title}
          aspect={activePreset.aspect}
          outputType="image/webp"
          quality={0.92}
          outputWidth={activePreset.exportSize?.w}
          outputHeight={activePreset.exportSize?.h}
          showPositionPresets
          onConfirm={async (blob) => {
            if (!cropMeta) return;
            setSaving(true);
            try {
              const ext = extForBlobType(blob.type);
              const file = new File([blob], `${cropMeta.field}.${ext}`, { type: blob.type });
              const url = await uploadCroppedImage({ file, target: cropMeta.target, field: cropMeta.field });
              commitUrl(cropMeta.target, cropMeta.field, url);
              toast({ title: "Image saved" });
            } catch (e: any) {
              toast({
                title: "Upload failed",
                description: e?.message ?? "Could not upload image",
                variant: "destructive",
              });
            } finally {
              setSaving(false);
            }
          }}
        />

        {saving ? <p className="text-xs text-muted-foreground">Saving…</p> : null}
      </CardContent>
    </Card>
  );
}
