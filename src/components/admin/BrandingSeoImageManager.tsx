import { useMemo, useRef, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ImageCropDialog } from "@/components/admin/ImageCropDialog";
import { resizeToPng } from "@/lib/imagePngVariants";

type PresetKey = "carousel_16_9" | "square_1_1" | "circle_1_1" | "favicon_square" | "favicon_circle";

const PRESETS: Record<
  PresetKey,
  {
    label: string;
    aspect: number;
    exportSize?: { w: number; h: number };
    maskShape?: MaskShape;
  }
> = {
  carousel_16_9: { label: "Carousel 16:9", aspect: 16 / 9, exportSize: { w: 1200, h: 675 } },
  square_1_1: { label: "Square 1:1", aspect: 1, exportSize: { w: 1024, h: 1024 }, maskShape: "square" },
  circle_1_1: { label: "Circle 1:1", aspect: 1, exportSize: { w: 1024, h: 1024 }, maskShape: "circle" },
  favicon_square: { label: "Favicon Square", aspect: 1, exportSize: { w: 256, h: 256 }, maskShape: "square" },
  favicon_circle: { label: "Favicon Circle", aspect: 1, exportSize: { w: 256, h: 256 }, maskShape: "circle" },
};

type Target = "branding" | "seo";

type CropMeta = {
  target: Target;
  field: string;
  title: string;
  preset: PresetKey;
};

type MaskShape = "square" | "circle";

type FaviconVariants = {
  png16?: string;
  png32?: string;
  png48?: string;
  png180?: string;
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

async function uploadBlobAsPng(params: {
  blob: Blob;
  target: Target;
  field: string;
  name: string;
}) {
  const { blob, target, field, name } = params;
  const file = new File([blob], name, { type: "image/png" });
  return await uploadCroppedImage({ file, target, field });
}

function presetForField(field: string): PresetKey {
  // Crop preset is controlled inside the crop dialog (shape toggles + aspect),
  // so the external dropdown is intentionally removed.
  switch (field) {
    case "shareImageUrl":
      return "carousel_16_9";
    case "faviconUrl":
      return "favicon_circle";
    case "logoUrl":
    case "iconUrl":
    default:
      return "circle_1_1";
  }
}

function ImageSlot(props: {
  title: string;
  description?: string;
  valueUrl?: string;
  onPick: (file: File) => void;
  previewShape?: "circle" | "square" | "wide";
}) {
  const { title, description, valueUrl, onPick, previewShape = "square" } = props;
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
  );
}

export function BrandingSeoImageManager(props: {
  branding: any;
  setBranding: (updater: any) => void;
  seo: any;
  setSeo: (updater: any) => void;
  /** Persist updated setting immediately (used so changes reflect in the real app without pressing Save). */
  onAutoSaveSetting?: (key: "branding" | "seo", value: any) => void;
}) {
  const { branding, setBranding, seo, setSeo } = props;
  const { toast } = useToast();

  const [cropOpen, setCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropMeta, setCropMeta] = useState<CropMeta | null>(null);
  const [saving, setSaving] = useState(false);

  const isFaviconFlow = cropMeta?.field === "faviconUrl";

  const activePreset = useMemo(() => {
    if (!cropMeta) return PRESETS.square_1_1;
    return PRESETS[cropMeta.preset];
  }, [cropMeta]);

  const activeMaskShape = useMemo(() => {
    return activePreset.maskShape ?? "circle";
  }, [activePreset]);

  const wantsAlpha = activeMaskShape === "circle";

  const beginCrop = (meta: CropMeta, file: File) => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropMeta(meta);
    setCropSrc(URL.createObjectURL(file));
    setCropOpen(true);
  };

  const commitUrl = (target: Target, field: string, url: string) => {
    if (target === "branding") {
      setBranding((prev: any) => {
        const next = { ...prev, [field]: url };
        props.onAutoSaveSetting?.("branding", next);
        return next;
      });
    } else {
      setSeo((prev: any) => {
        const next = { ...prev, [field]: url };
        props.onAutoSaveSetting?.("seo", next);
        return next;
      });
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
            onPick={(file) =>
              beginCrop(
                {
                  target: "branding",
                  field: "logoUrl",
                  title: "Crop Logo",
                  preset: presetForField("logoUrl"),
                },
                file,
              )
            }
          />

          <ImageSlot
            title="App Icon"
            description="Square icon used inside the app."
            valueUrl={branding.iconUrl}
            previewShape="circle"
            onPick={(file) =>
              beginCrop(
                {
                  target: "branding",
                  field: "iconUrl",
                  title: "Crop App Icon",
                  preset: presetForField("iconUrl"),
                },
                file,
              )
            }
          />

          <ImageSlot
            title="Favicon"
            description="Shown in browser tab. Recommend simple, high-contrast."
            valueUrl={branding.faviconUrl}
            previewShape="circle"
            onPick={(file) =>
              beginCrop(
                {
                  target: "branding",
                  field: "faviconUrl",
                  title: "Crop Favicon",
                  preset: presetForField("faviconUrl"),
                },
                file,
              )
            }
          />

          <ImageSlot
            title="Share Image (OG)"
            description="Used when sharing links on social apps."
            valueUrl={seo.shareImageUrl}
            previewShape="wide"
            onPick={(file) =>
              beginCrop(
                {
                  target: "seo",
                  field: "shareImageUrl",
                  title: "Crop Share Image",
                  preset: presetForField("shareImageUrl"),
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
          outputType={isFaviconFlow || wantsAlpha ? "image/png" : "image/webp"}
          quality={isFaviconFlow || wantsAlpha ? 1 : 0.92}
          outputWidth={activePreset.exportSize?.w}
          outputHeight={activePreset.exportSize?.h}
          maskShape={activeMaskShape}
          showShapePresets
          onConfirm={async (blob, meta) => {
            if (!cropMeta) return;
            setSaving(true);
            try {
              const ext = extForBlobType(blob.type);
              const file = new File([blob], `${cropMeta.field}.${ext}`, { type: blob.type });
              const url = await uploadCroppedImage({ file, target: cropMeta.target, field: cropMeta.field });

              // Save main URL
              commitUrl(cropMeta.target, cropMeta.field, url);

              // Auto-generate favicon PNG variants
              if (cropMeta.target === "branding" && cropMeta.field === "faviconUrl") {
                const shape = meta?.maskShape ?? activeMaskShape;
                const [png16, png32, png48, png180] = await Promise.all([
                  resizeToPng({ source: blob, size: 16, maskShape: shape }),
                  resizeToPng({ source: blob, size: 32, maskShape: shape }),
                  resizeToPng({ source: blob, size: 48, maskShape: shape }),
                  resizeToPng({ source: blob, size: 180, maskShape: shape }),
                ]);

                const [url16, url32, url48, url180] = await Promise.all([
                  uploadBlobAsPng({ blob: png16, target: "branding", field: "faviconVariants", name: "favicon-16.png" }),
                  uploadBlobAsPng({ blob: png32, target: "branding", field: "faviconVariants", name: "favicon-32.png" }),
                  uploadBlobAsPng({ blob: png48, target: "branding", field: "faviconVariants", name: "favicon-48.png" }),
                  uploadBlobAsPng({ blob: png180, target: "branding", field: "faviconVariants", name: "apple-touch-icon-180.png" }),
                ]);

                setBranding((prev: any) => {
                  const next = {
                    ...prev,
                    faviconVariants: {
                      ...(prev?.faviconVariants || ({} as FaviconVariants)),
                      png16: url16,
                      png32: url32,
                      png48: url48,
                      png180: url180,
                    },
                  };
                  props.onAutoSaveSetting?.("branding", next);
                  return next;
                });
              }

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
